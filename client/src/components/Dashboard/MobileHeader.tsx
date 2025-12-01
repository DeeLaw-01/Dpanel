import { Menu } from 'lucide-react'
import { Server } from 'lucide-react'

interface MobileHeaderProps {
  onMenuClick: () => void
}

export default function MobileHeader ({ onMenuClick }: MobileHeaderProps) {
  return (
    <div className='md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 z-30 flex items-center justify-between px-4'>
      <div className='flex items-center gap-2'>
        <Server className='h-6 w-6 text-green-500' />
        <span className='text-lg font-bold text-white'>DPanel</span>
      </div>
      <button
        onClick={onMenuClick}
        className='p-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors'
        aria-label='Open menu'
      >
        <Menu className='h-6 w-6' />
      </button>
    </div>
  )
}

