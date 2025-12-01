import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple'
}

const colorClasses = {
  green: 'bg-green-600',
  blue: 'bg-blue-600',
  yellow: 'bg-yellow-600',
  red: 'bg-red-600',
  purple: 'bg-purple-600'
}

export default function StatsCard ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'green'
}: StatsCardProps) {
  return (
    <div className='rounded-lg bg-gray-800 p-6 border border-gray-700 hover:border-gray-600 transition-colors'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-400'>{title}</p>
          <p className='mt-2 text-3xl font-bold text-white'>{value}</p>
          {subtitle && <p className='mt-1 text-sm text-gray-500'>{subtitle}</p>}
        </div>
        <div className={`rounded-lg ${colorClasses[color]} p-3`}>
          <Icon className='h-6 w-6 text-white' />
        </div>
      </div>
    </div>
  )
}
