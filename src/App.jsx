import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import Header from './components/Header/Header'
import Loader from './components/Loader/Loader'
import Hero from './components/Hero/Hero'
import EstateDirectory from './components/EstateDirectory/EstateDirectory'
import About from './components/About/About'
import Footer from './components/Footer/Footer'

import FirstAid from './pages/FirstAid/FirstAid'
import Estate from './pages/Estate/Estate'
import Composition from './pages/Composition/Composition'
import Promotion from './pages/Promotion/Promotion'
import Gallery from './pages/Gallery/Gallery'
import Information from './pages/Information/Information'
import PromotionInfo from './pages/PromotionInfo/PromotionInfo'
import Anatomy from './pages/Anatomy/Anatomy'
import MedicalInformation from './pages/MedicalInformation/MedicalInformation'
import Tests from './pages/Tests/Tests'
import Admin from './pages/Admin/Admin'

import './App.css'
import './styles/Theme.css'

function Home() {
  return (
    <>
      <Hero />
      <EstateDirectory />
      <About />
    </>
  )
}

function App() {
  const location = useLocation()
  const [loadedNavigation, setLoadedNavigation] = useState(null)
  // Новый переход сразу показывает загрузчик, без дополнительного рендера из эффекта.
  const loading = loadedNavigation !== location.key

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadedNavigation(location.key)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 850)

    return () => clearTimeout(timer)
  }, [location.key])

  return (
    <>
      {loading && <Loader />}

      <Header />

      <main className={`page-shell ${loading ? 'page-shell--hidden' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/first-aid" element={<FirstAid />} />
          <Route path="/anatomy" element={<Anatomy />} />
          <Route path="/medical-information" element={<MedicalInformation />} />
          <Route path="/estate" element={<Estate />} />
          <Route path="/composition" element={<Composition />} />
          <Route path="/promotion" element={<Promotion />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/information" element={<Information />} />
          <Route path="/promotion-info" element={<PromotionInfo />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <Footer />
    </>
  )
}

export default App
