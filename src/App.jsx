import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import Header from './components/Header/Header'
import Loader from './components/Loader/Loader'
import Hero from './components/Hero/Hero'
import About from './components/About/About'

import FirstAid from './pages/FirstAid/FirstAid'
import Estate from './pages/Estate/Estate'
import Composition from './pages/Composition/Composition'
import Promotion from './pages/Promotion/Promotion'
import Gallery from './pages/Gallery/Gallery'
import Information from './pages/Information/Information'

import './App.css'

function Home() {
  return (
    <>
      <Hero />
      <About />
    </>
  )
}

function App() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    const timer = setTimeout(() => {
      setLoading(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 850)

    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <>
      {loading && <Loader />}

      <Header />

      <main className={`page-shell ${loading ? 'page-shell--hidden' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/first-aid" element={<FirstAid />} />
          <Route path="/estate" element={<Estate />} />
          <Route path="/composition" element={<Composition />} />
          <Route path="/promotion" element={<Promotion />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/information" element={<Information />} />
        </Routes>
      </main>
    </>
  )
}

export default App