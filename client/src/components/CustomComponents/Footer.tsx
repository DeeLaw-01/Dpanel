import { Link } from 'react-router-dom'

export default function Footer () {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-[var(--card)] border-t border-[var(--border)] mt-auto'>
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Brand Section */}
          <div className='col-span-1 md:col-span-2'>
            <Link
              to='/'
              className='text-xl font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors'
            >
              HackStarter
            </Link>
            <p className='mt-2 text-[var(--foreground-muted)] max-w-md'>
              A barebones hackathon starter template designed for rapid
              prototyping and development. Focus on functionality over
              aesthetics.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='font-semibold text-[var(--foreground)] mb-4'>
              Quick Links
            </h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  to='/'
                  className='text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors'
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to='/dashboard'
                  className='text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors'
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to='/register'
                  className='text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors'
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className='font-semibold text-[var(--foreground)] mb-4'>
              Resources
            </h3>
            <ul className='space-y-2'>
              <li>
                <a
                  href='https://github.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors'
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href='https://github.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors'
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href='mailto:support@example.com'
                  className='text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors'
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='mt-8 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center'>
          <p className='text-[var(--foreground-muted)] text-sm'>
            © {currentYear} HackStarter. Built for hackathons.
          </p>
          <div className='flex space-x-6 mt-4 md:mt-0'>
            <a
              href='#'
              className='text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors text-sm'
            >
              Privacy Policy
            </a>
            <a
              href='#'
              className='text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors text-sm'
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
