import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './Pages/Minecraft/Dashboard'
import Console from './Pages/Minecraft/Console'
import Stats from './Pages/Minecraft/Stats'
import ConfigEditor from './Pages/Minecraft/ConfigEditor'
import BukkitSpigotEditor from './Pages/Minecraft/BukkitSpigotEditor'
import LoginPage from './Pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'

function App () {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path='console' element={<Console />} />
          <Route path='stats' element={<Stats />} />
          <Route path='config' element={<ConfigEditor />} />
          <Route path='bukkit-spigot' element={<BukkitSpigotEditor />} />
        </Route>
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
