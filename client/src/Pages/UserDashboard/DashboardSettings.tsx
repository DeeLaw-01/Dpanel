import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Lock,
  Bell,
  Moon,
  Sun,
  Shield,
  Settings as SettingsIcon
} from 'lucide-react'
import { useTheme } from '@/lib/theme-provider'

export default function DashboardSettings () {
  const { theme, setTheme } = useTheme()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)

  const handleSaveSettings = () => {
    toast.success('Settings saved', {
      description: 'Your settings have been updated successfully'
    })
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6 flex items-center gap-2'>
        <SettingsIcon className='text-[var(--primary)]' />
        Settings
      </h1>

      <div className='space-y-6'>
        {/* Appearance */}
        <div className='bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg'>
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <h2 className='text-lg font-medium'>Appearance</h2>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Theme Mode</p>
                <p className='text-sm text-[var(--dashboard-text-muted)]'>
                  Current theme: {theme === 'dark' ? 'Dark' : 'Light'} mode
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={theme === 'dark'}
                  onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                />
                <div className="w-11 h-6 bg-[var(--dashboard-card-hover)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--dashboard-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className='bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg'>
              <Bell size={18} />
            </div>
            <h2 className='text-lg font-medium'>Notifications</h2>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Email Notifications</p>
                <p className='text-sm text-[var(--dashboard-text-muted)]'>
                  Receive notifications via email
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                />
                <div className="w-11 h-6 bg-[var(--dashboard-card-hover)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--dashboard-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Push Notifications</p>
                <p className='text-sm text-[var(--dashboard-text-muted)]'>
                  Receive push notifications
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={pushNotifications}
                  onChange={() => setPushNotifications(!pushNotifications)}
                />
                <div className="w-11 h-6 bg-[var(--dashboard-card-hover)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--dashboard-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className='bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg'>
              <Shield size={18} />
            </div>
            <h2 className='text-lg font-medium'>Security</h2>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Two-Factor Authentication</p>
                <p className='text-sm text-[var(--dashboard-text-muted)]'>
                  Add an extra layer of security
                </p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={twoFactorAuth}
                  onChange={() => setTwoFactorAuth(!twoFactorAuth)}
                />
                <div className="w-11 h-6 bg-[var(--dashboard-card-hover)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--dashboard-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>

            <div>
              <Button
                variant='outline'
                className='text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] bg-[var(--dashboard-card-hover)]/50 hover:bg-[var(--dashboard-card-hover)] border-[var(--dashboard-border)]'
              >
                <Lock size={16} className='mr-2' />
                Change Password
              </Button>
            </div>
          </div>
        </div>

        <div className='flex justify-end'>
          <Button
            onClick={handleSaveSettings}
            className='bg-[var(--primary)] hover:bg-[var(--primary)]/90'
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
