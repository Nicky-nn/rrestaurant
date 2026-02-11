import '@fontsource/roboto' // Defaults to weight 400
import '@fontsource/roboto/300.css' // Specify weight
import '@fontsource/roboto/400.css' // Specify weight
import '@fontsource/roboto/500.css' // Specify weight
import '@fontsource/roboto/700.css' // Specify weight
import '@fontsource/roboto/900.css' // Specify weight
import '@fontsource/roboto/400-italic.css' // Specify weight and style
import 'material-icons/iconfont/material-icons.css'
import './index.css'
import 'rc-input-number/assets/index.css'
import 'react-toastify/dist/ReactToastify.css'
import 'react-datepicker/dist/react-datepicker.css'
import './styles/accordion.css'
import './styles/reactDatePicker.css'

import { StyledEngineProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <BrowserRouter>
        <QueryClientProvider client={new QueryClient()}>
          <App />
          <ToastContainer limit={3} />
        </QueryClientProvider>
      </BrowserRouter>
    </StyledEngineProvider>
  </React.StrictMode>,
)
