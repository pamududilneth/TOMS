import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { msalConfig } from './lib/msalConfig'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

const msalInstance = new PublicClientApplication(msalConfig)

async function startApp() {
  await msalInstance.initialize()
  await msalInstance.handleRedirectPromise()

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </MsalProvider>
    </StrictMode>,
  )
}

startApp()