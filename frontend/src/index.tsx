import React from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { ToastContainer } from 'react-toastify'
import App from './App'
import theme from './utils/theme'
import 'react-toastify/dist/ReactToastify.css'

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
    </ThemeProvider>
  </React.StrictMode>
)
