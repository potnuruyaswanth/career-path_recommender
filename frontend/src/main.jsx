import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import Onboarding from './pages/Onboarding'
import Explore from './pages/Explore'
import StreamDetail from './pages/StreamDetail'
import VariantPaths from './pages/VariantPaths'
import CareerDetail from './pages/CareerDetail'
import ActionDetail from './pages/ActionDetail'
import VisualChart from './components/VisualChart'
import CareerChatbot from './components/CareerChatbot'
import Footer from './components/Footer'
import { initScrollAnimations } from './utils/scrollAnimations'
import './index.css'

// Initialize scroll animations on mount
window.addEventListener('load', () => {
  initScrollAnimations()
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Onboarding/>} />
        <Route path='/home' element={<App/>} />
        <Route path='/explore' element={<Explore/>} />
        <Route path='/explore/:streamId' element={<StreamDetail/>} />
        <Route path='/explore/:streamId/variants' element={<VariantPaths/>} />
        <Route path='/career/:careerId' element={<CareerDetail/>} />
        <Route path='/action/:actionId' element={<ActionDetail/>} />
        <Route path='*' element={<Navigate to='/' replace/>} />
      </Routes>
      <Footer />
      <CareerChatbot />
    </BrowserRouter>
  </React.StrictMode>
)

