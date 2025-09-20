import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


const queryClinet=new QueryClient({
   defaultOptions:{
      queries:{
        retry:0,
      }
   }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClinet}>
      <App />
    </QueryClientProvider>
    
  </StrictMode>,
)
