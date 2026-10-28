import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import authService from "./services/auth"
import {login, logout} from "./store/authSlice"
import { Footer, Header } from './components'
import { Outlet } from 'react-router-dom'

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    authService.getCurrentUser()
    .then((userData) => {
      if (userData) {
        dispatch(login(userData))
      } else {
        dispatch(logout())
      }
    })
    .finally(() => setLoading(false))
  }, [dispatch])
  
  return !loading ? (
    <div className='min-h-screen bg-[var(--bg-page)] text-slate-900 antialiased'>
      <div className='flex min-h-screen flex-col'>
        <Header />
        <main className='relative flex-1 overflow-x-hidden'>
          <div className='pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),transparent_58%)]' />
          <div className='relative'>
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  ) : null
}

export default App
