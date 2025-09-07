import { PushDrop, Utils, Beef, WalletInterface } from '@bsv/sdk'

export interface EventLogResult {
  txid: string
  message: string
  timestamp: string
}

export class EventLogger {
  private wallet: WalletInterface
  private pushdrop: PushDrop

  private readonly PROTOCOL_ID: [1, string] = [1, 'Event Logger']
  private readonly KEY_ID = '1'
  private readonly BASKET_NAME = 'event logs v2'

  constructor(wallet: WalletInterface) {
    this.wallet = wallet
    this.pushdrop = new PushDrop(wallet)
  }

  async logEvent(eventData: Record<string, any>): Promise<Omit<EventLogResult, 'timestamp'>> {
    const timestamp = new Date().toISOString()
    const ip = 'unknown'
    const endpoint = '/log-event'

    const payload = { ip, timestamp, endpoint, ...eventData }

    const lockingscript = await this.pushdrop.lock(
      [Utils.toArray(JSON.stringify(payload))],
      this.PROTOCOL_ID,
      this.KEY_ID,
      'self',
      true,
      false,
      'before'
    )

    const car = await this.wallet.createAction({
      outputs: [
        {
          lockingScript: lockingscript.toHex(),
          satoshis: 1,
          outputDescription: 'log-event',
          tags: ['eventlog'],
          basket: this.BASKET_NAME
        }
      ],
      options: {
        randomizeOutputs: false,
        acceptDelayedBroadcast: false
      },
      labels: ['log-event'],
      description: 'log-event'
    })

    const txid = car.txid ?? 'unknown-txid'
    return { txid, message: 'Event logged successfully' }
  }

  async retrieveLogs(): Promise<EventLogResult[]> {
    const { BEEF } = await this.wallet.listOutputs({
      basket: this.BASKET_NAME,
      include: 'entire transactions',
      includeCustomInstructions: true
    })

    if (!BEEF) return []

    const logs: EventLogResult[] = []
    const beef = Beef.fromBinary(BEEF)

    for (const atomic of beef.txs) {
      const tx = beef.findAtomicTransaction(atomic.txid)
      if (!tx) continue
      const output0 = tx.outputs?.[0]
      const script = output0?.lockingScript
      if (!script) continue
      try {
        const decoded = PushDrop.decode(script)
        const json = Utils.toUTF8(decoded.fields[0])
        const metadata = JSON.parse(json)
        logs.push({
          txid: atomic.txid,
          message: metadata.message ?? json,
          timestamp: metadata.timestamp ?? new Date().toISOString()
        })
      } catch {
        continue
      }
    }

    // Newest first by timestamp if present
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return logs
  }
}
