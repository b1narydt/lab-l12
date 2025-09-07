import { createTheme } from '@mui/material/styles'

const web3Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00e5ff' },
    secondary: { main: '#7c4dff' },
    background: { default: '#0b0f17', paper: '#101521' },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  },
  shape: { borderRadius: 10 },
})

export default web3Theme
