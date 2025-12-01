import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import Sidebar from './Dashboard/Sidebar'
import MobileSidebar from './Dashboard/MobileSidebar'
import MobileHeader from './Dashboard/MobileHeader'

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className='flex h-screen bg-gray-950 text-white overflow-hidden'>
      {/* Desktop Sidebar */}
      <div className='hidden md:block'>
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden pt-16 md:pt-0'>
        <Outlet />
      </div>

      <Toaster position='top-right' theme='dark' />
    </div>
  )
}

