import { Link } from 'react-router-dom'

export default function HomePage () {
  return (
    <div className='min-h-screen bg-[var(--background)] text-[var(--foreground)]'>
      {/* Hero Section */}
      <section className='py-16 px-4'>
        <div className='container mx-auto text-center'>
          <h1 className='text-4xl md:text-5xl font-bold mb-6'>
            Welcome to Our Platform
          </h1>
          <p className='text-[var(--foreground-muted)] text-xl max-w-3xl mx-auto mb-8'>
            A versatile template for building modern web applications with
            customizable themes and components.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              to='/dashboard'
              className='px-6 py-3 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors'
            >
              Dashboard
            </Link>
            <Link
              to='/register'
              className='px-6 py-3 border border-[var(--border)] rounded-md hover:bg-[var(--accent)]/10 transition-colors'
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-16 px-4 bg-[var(--card)] border-y border-[var(--border)]'>
        <div className='container mx-auto'>
          <h2 className='text-3xl font-bold text-center mb-12'>Key Features</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-[var(--background)] p-6 rounded-lg border border-[var(--border)]'>
              <h3 className='text-xl font-semibold mb-3'>Responsive Design</h3>
              <p className='text-[var(--foreground-muted)]'>
                Fully responsive layout that works on all devices, from mobile
                to desktop.
              </p>
            </div>
            <div className='bg-[var(--background)] p-6 rounded-lg border border-[var(--border)]'>
              <h3 className='text-xl font-semibold mb-3'>Theme Support</h3>
              <p className='text-[var(--foreground-muted)]'>
                Light and dark mode with customizable color variables for the
                entire site.
              </p>
            </div>
            <div className='bg-[var(--background)] p-6 rounded-lg border border-[var(--border)]'>
              <h3 className='text-xl font-semibold mb-3'>Component Library</h3>
              <p className='text-[var(--foreground-muted)]'>
                Extensive collection of pre-built components to speed up
                development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-16 px-4'>
        <div className='container mx-auto text-center'>
          <h2 className='text-3xl font-bold mb-6'>Ready to Get Started?</h2>
          <p className='text-[var(--foreground-muted)] max-w-2xl mx-auto mb-8'>
            Join thousands of users who are already using our platform to build
            amazing applications.
          </p>
          <Link
            to='/dashboard'
            className='px-6 py-3 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] inline-block transition-colors'
          >
            Go to Dashboard
          </Link>
        </div>
      </section>
    </div>
  )
}
