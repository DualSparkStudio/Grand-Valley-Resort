import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Preloader from './components/Preloader'

function Root() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <StrictMode>
      {isLoading ? (
        <Preloader onComplete={() => setIsLoading(false)} />
      ) : (
        <App />
      )}
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<Root />)
