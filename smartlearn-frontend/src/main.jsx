import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

// Force apply theme instantly before React renders to prevent layout shifts or unstyled flashes
const isDark = localStorage.getItem("sl_theme_pro") !== "false";
if (isDark) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

const savedColor = localStorage.getItem("sl_theme_color") || "#ff3131";
document.documentElement.style.setProperty("--primary", savedColor);
document.documentElement.style.setProperty("--ring", savedColor);


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
