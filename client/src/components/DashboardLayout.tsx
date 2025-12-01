import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import Sidebar from './Dashboard/Sidebar'

export default function DashboardLayout() {
  return (
    <div className='flex h-screen bg-gray-950 text-white overflow-hidden'>
      <Sidebar />
      <Outlet />
      <Toaster position='top-right' theme='dark' />
    </div>
  )
}

