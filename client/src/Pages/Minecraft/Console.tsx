import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import Header from '../../components/Dashboard/Header'
import Terminal from '../../components/Dashboard/Terminal'
import { minecraftApi } from '../../api/minecraft'
import { toast } from 'sonner'
import { useUserRole } from '../../hooks/useUserRole'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Console () {
  const { isReadOnly } = useUserRole()
  const [logs, setLogs] = useState<string[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Fetch initial logs
    const fetchInitialLogs = async () => {
      try {
        const initialLogs = await minecraftApi.getLogs(100)
        setLogs(initialLogs)
      } catch (error) {
        console.error('Failed to fetch initial logs:', error)
        toast.error('Failed to load initial logs')
      }
    }

    fetchInitialLogs()

    // Connect to WebSocket for real-time logs
    const newSocket = io(SOCKET_URL)

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket')
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket')
      setConnected(false)
    })

    newSocket.on('minecraft:log', (logLine: string) => {
      setLogs(prev => [...prev, logLine].slice(-500)) // Keep last 500 lines
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const handleCommand = async (command: string) => {
    if (isReadOnly) {
      toast.error('Read-only users cannot send commands')
      return
    }
    try {
      const result = await minecraftApi.sendCommand(command)
      if (result.success) {
        toast.success('Command sent successfully')
        setLogs(prev => [...prev, `> ${command}`])
      } else {
        toast.error(result.message || 'Failed to send command')
      }
    } catch (error) {
      console.error('Failed to send command:', error)
      toast.error('Failed to send command')
    }
  }

  return (
    <div className='flex-1 flex flex-col overflow-hidden'>
      <Header
        title='Server Console'
        subtitle='View logs and execute server commands'
      />

      <div className='flex-1 p-4 md:p-6 overflow-hidden'>
        <div className='h-full flex flex-col'>
          {!connected && (
            <div className='mb-4 bg-yellow-900 border border-yellow-700 text-yellow-200 px-4 py-2 rounded-lg'>
              <p className='text-sm'>
                WebSocket disconnected. Real-time logs may not update.
              </p>
            </div>
          )}
          <Terminal logs={logs} onCommand={handleCommand} readOnly={isReadOnly} />
        </div>
      </div>
    </div>
  )
}
