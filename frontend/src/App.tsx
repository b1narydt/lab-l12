import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Box
} from '@mui/material';
import Footer from './utils/footer'

export default function App() {
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<Array<{ txid: string; message: string; timestamp: string }>>([]);
  const [status, setStatus] = useState<string | null>(null);

  const handleLogEvent = async () => {
    setStatus('Logging...');
    try {
      const response = await fetch('http://localhost:3000/log-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventData: { message } })
      });
      const data = await response.json();
      if (response.ok) {
        setStatus(`Logged with txid: ${data.txid}`);
        setMessage('');
        // Refresh logs so the newest item appears immediately
        await handleRetrieveLogs();
      } else {
        setStatus(`Failed: ${data.message}`);
      }
    } catch (error) {
      setStatus(`Error: ${String(error)}`);
    }
  };

  const handleRetrieveLogs = async () => {
    try {
      const response = await fetch('http://localhost:3000/retrieve-logs');
      const data = await response.json();
      if (response.ok && Array.isArray(data.logs)) {
        const sorted = (data.logs as Array<{ txid: string; message: string; timestamp: string }>)
          .slice()
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(sorted);
        // Only set a benign status if we don't already show a txid message
        setStatus(prev => (prev && prev.startsWith('Logged with txid:') ? prev : 'Logs retrieved'));
      } else {
        setStatus('Failed to retrieve logs');
      }
    } catch (error) {
      setStatus(`Error retrieving logs: ${String(error)}`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={4} alignItems="center">
        <Typography variant="h4" fontWeight="bold" align="center">
          Lab L-12: Event Logger
        </Typography>
        <TextField
          fullWidth
          label="Enter an event message"
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="primary" onClick={handleLogEvent}>
            Log Event
          </Button>
          <Button variant="contained" color="success" onClick={handleRetrieveLogs}>
            Retrieve Logs
          </Button>
        </Stack>
        {status && (
          <Typography variant="body2" color="text.secondary" align="center">
            {status}
          </Typography>
        )}
        <Card sx={{ width: '100%', maxWidth: '1000px', overflowX: 'auto', bgcolor: 'grey.900', color: 'white', p: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom align="center">
              Logged Events
            </Typography>
            {logs.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center">
                No logs yet.
              </Typography>
            ) : (
              <Box component="ul" sx={{ listStyleType: 'none', pl: 0, m: 0 }}>
                {logs.map((log, idx) => (
                  <Box component="li" key={idx} sx={{ mb: 1, p: 1, border: '1px solid #22304a', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {`txid: ${log.txid}`}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {`message: ${log.message}`}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {`timestamp: ${log.timestamp}`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Stack>
      <Footer />
    </Container>
  );
}