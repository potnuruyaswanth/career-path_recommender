/**
 * API Base URL Configuration
 * Intelligently detects the correct API endpoint based on environment
 * 
 * Rules:
 * 1. Use VITE_API_BASE env var if available (Vercel production)
 * 2. If on localhost/127.0.0.1 domain: use local backend (development)
 * 3. Otherwise: use Render production backend (mobile/other domains)
 */

export const getApiBase = () => {
  // Render backend URL
  const renderBackendUrl = 'https://career-navigator-backend-7el6.onrender.com'
  const localBackendUrl = 'http://localhost:8000'

  // 1) Check for environment variable override (Vercel)
  if (import.meta.env.VITE_API_BASE) {
    console.log('API: Using VITE_API_BASE env var:', import.meta.env.VITE_API_BASE)
    return import.meta.env.VITE_API_BASE
  }

  // 2) Development: localhost or 127.0.0.1
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168')) {
      console.log('API: Using local backend (development):', localBackendUrl)
      return localBackendUrl
    }
  }

  // 3) Production: Render backend
  console.log('API: Using Render production backend:', renderBackendUrl)
  return renderBackendUrl
}

export const API_BASE = getApiBase()

export default API_BASE

