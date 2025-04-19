import '../styles/globals.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function App({ Component, pageProps }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden font-sans">
      {/* 🎥 Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-[-1] pointer-events-none opacity-50"
      >
        <source src="/background.mp4" type="video/mp4" />
        Din nettleser støtter ikke video.
      </video>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-900/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and name */}
            <Link href="/" className="flex items-center space-x-3 group">
              <img src="/logo.png" alt="CoreMind logo" className="h-10 w-10 object-contain transition-transform group-hover:scale-110" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                CoreMind
              </span>
            </Link>

            {/* Desktop menu items */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="nav-link">Hjem</Link>
              <Link href="/coremind-mental" className="nav-link">Mental trening</Link>
              <Link href="/coremind-trening" className="nav-link">Fysisk trening</Link>
              <Link href="/kosthold" className="nav-link">Kosthold</Link>
              <Link href="/drommetolkning" className="nav-link">Drømmetolkning</Link>
              <Link href="/om" className="nav-link">Om CoreMind</Link>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          <div 
            className={`md:hidden transition-all duration-300 ease-in-out ${
              mobileMenuOpen 
                ? 'max-h-[500px] opacity-100 visible' 
                : 'max-h-0 opacity-0 invisible'
            } overflow-hidden`}
          >
            <div className="px-4 py-3 space-y-2 bg-gray-900/95 backdrop-blur-md rounded-lg mt-2 border border-gray-800 shadow-xl">
              <Link 
                href="/" 
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Hjem
                </span>
              </Link>
              <Link 
                href="/coremind-mental" 
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Mental trening
                </span>
              </Link>
              <Link 
                href="/coremind-trening" 
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Fysisk trening
                </span>
              </Link>
              <Link 
                href="/kosthold" 
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Kosthold
                </span>
              </Link>
              <Link 
                href="/drommetolkning" 
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Drømmetolkning
                </span>
              </Link>
              <Link 
                href="/om" 
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Om CoreMind
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 pt-16">
        <Component {...pageProps} />
      </main>
    </div>
  );
}

// Add styles for navigation links
const styles = `
  .nav-link {
    @apply text-gray-300 hover:text-white transition-colors duration-200 relative;
  }
  
  .nav-link::after {
    content: '';
    @apply absolute left-0 bottom-0 w-0 h-0.5 bg-primary-500 transition-all duration-200;
  }
  
  .nav-link:hover::after {
    @apply w-full;
  }

  .mobile-nav-link {
    @apply block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200;
  }
`;
