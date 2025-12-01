import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Sidebar from './components/Dashboard/Sidebar'
import Dashboard from './Pages/Minecraft/Dashboard'
import Console from './Pages/Minecraft/Console'
import Stats from './Pages/Minecraft/Stats'
import ConfigEditor from './Pages/Minecraft/ConfigEditor'
import BukkitSpigotEditor from './Pages/Minecraft/BukkitSpigotEditor'

function App () {
  return (
    <BrowserRouter>
      <div className='flex h-screen bg-gray-950 text-white overflow-hidden'>
        <Sidebar />
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/console' element={<Console />} />
          <Route path='/stats' element={<Stats />} />
          <Route path='/config' element={<ConfigEditor />} />
          <Route path='/bukkit-spigot' element={<BukkitSpigotEditor />} />
        </Routes>
        <Toaster position='top-right' theme='dark' />
      </div>
    </BrowserRouter>
  )
}

export default App
