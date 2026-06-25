import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar, BottomNav } from './components/NavBar'
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

        {/* Main app */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              {/* pb-20 on mobile so content clears the bottom nav */}
              <main className="flex-1 overflow-auto pb-20 lg:pb-0">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/pantry" element={<Pantry />} />
                  <Route path="/meals" element={<Meals />} />
                  <Route path="/log" element={<LogPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </main>
              <BottomNav />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
