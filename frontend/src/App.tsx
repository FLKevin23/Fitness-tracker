import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import Pantry from './pages/Pantry'
import Meals from './pages/Meals'
import LogPage from './pages/LogPage'
import ProfilePage from './pages/ProfilePage'
import TrainerView from './pages/TrainerView'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trainer view — no nav */}
        <Route path="/trainer/:token" element={<TrainerView />} />

        {/* Main app with sidebar */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen">
              <NavBar />
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/pantry" element={<Pantry />} />
                  <Route path="/meals" element={<Meals />} />
                  <Route path="/log" element={<LogPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
