import express, { Express, RequestHandler } from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { Setup, sdk } from '@bsv/wallet-toolbox'
import { EventLogger } from './event-logger.js'

// Load env variables
dotenv.config()

const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY || ''
const WALLET_STORAGE_URL = process.env.WALLET_STORAGE_URL || 'https://storage.babbage.systems'
const BSV_NETWORK = process.env.BSV_NETWORK || 'main'

interface LogEventRequest {
  eventData: Record<string, any>
}

interface LogEventResponse {
  txid: string
  message: string
}

const app: Express = express()
const port = process.env.PORT || 3000

async function initialize() {
  // Validate required env vars
  const missing: string[] = []
  if (!SERVER_PRIVATE_KEY) missing.push('SERVER_PRIVATE_KEY')
  if (!WALLET_STORAGE_URL) missing.push('WALLET_STORAGE_URL')
  if (!BSV_NETWORK) missing.push('BSV_NETWORK')
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`)
  }

  // 1) Initialize BSV wallet
  const wallet = await Setup.createWalletClientNoEnv({
    rootKeyHex: SERVER_PRIVATE_KEY,
    storageUrl: WALLET_STORAGE_URL,
    chain: BSV_NETWORK as sdk.Chain
  })

  if (!wallet || typeof (wallet as any).createAction !== 'function') {
    throw new Error('Wallet initialization failed or missing required methods')
  }

  // 2) Create EventLogger instance
  const eventLogger = new EventLogger(wallet)

  // 3) Configure body-parser middleware
  app.use(bodyParser.json({ limit: '2mb' }))

  // 4) Set up CORS middleware
  const corsMiddleware: RequestHandler = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    res.header('Access-Control-Allow-Methods', '*')
    res.header('Access-Control-Expose-Headers', '*')
    res.header('Access-Control-Allow-Private-Network', 'true')
    if (req.method === 'OPTIONS') return res.sendStatus(200)
    next()
  }
  app.use(corsMiddleware)

  // 5) Implement /log-event POST endpoint
  app.post('/log-event', async (req, res) => {
    try {
      const { eventData } = req.body as LogEventRequest
      if (!eventData || typeof eventData !== 'object' || Array.isArray(eventData)) {
        return res.status(400).json({ message: 'Event data is required' } as Partial<LogEventResponse>)
      }
      const result = await eventLogger.logEvent(eventData)
      return res.json(result as LogEventResponse)
    } catch (err) {
      console.error('Failed to log event:', err)
      return res.status(500).json({ message: 'Failed to log event' } as Partial<LogEventResponse>)
    }
  })

  // 6) Implement /retrieve-logs GET endpoint
  app.get('/retrieve-logs', async (req, res) => {
    try {
      const logs = await eventLogger.retrieveLogs()
      res.json({ logs })
    } catch (err) {
      console.error('Failed to retrieve logs:', err)
      res.status(500).json({ message: 'Failed to retrieve logs' })
    }
  })

  // 7) Start the Express server
  app.listen(port, () => {
    console.log(`Logger server running on port ${port}`)
  })
}

initialize().catch(err => {
  console.error('Failed to initialize backend wallet:', err)
  process.exit(1)
})
