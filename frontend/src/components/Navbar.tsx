import React, { useState, useEffect } from 'react';

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onStartLearning: () => void;
  onAuthClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleTheme, onStartLearning, onAuthClick }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolling, setIsScrolling] = useState(false);
  const [userClicked, setUserClicked] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // Don't update active section if user just clicked a nav item or is still scrolling
      if (isScrolling || userClicked) return;

      // Clear existing timeout
      if (scrollTimeout) clearTimeout(scrollTimeout);

      // Debounce scroll detection
      scrollTimeout = setTimeout(() => {
        const sections = ['home', 'features', 'about', 'testimonials', 'faq', 'try'];
        const scrollPosition = window.scrollY + 100; // Offset for better detection

        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              if (activeSection !== section) {
                console.log(`Active section changed to: ${section} (via scroll)`);
                setActiveSection(section);
              }
              break;
            }
          }
        }
      }, 50); // 50ms debounce
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [activeSection, isScrolling, userClicked]);

  const handleNavClick = (sectionId: string) => {
    console.log(`Nav clicked: ${sectionId}`);
    setActiveSection(sectionId);
    setIsScrolling(true);
    setUserClicked(true);

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });

      // Reset flags after animation completes
      setTimeout(() => {
        setIsScrolling(false);
        console.log(`Scrolling flag reset, active section: ${sectionId}`);
      }, 1000); // Smooth scroll typically takes ~800ms

      // Reset user clicked flag after a longer delay to ensure active state persists
      setTimeout(() => {
        setUserClicked(false);
        console.log(`User clicked flag reset`);
      }, 2000);
    }
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#4f46e5' }}>
          LearnPath
        </div>
        {/* Hamburger for mobile */}
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(v => !v)} aria-label="Toggle menu" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '2rem' }}>
          <span>{isMobileMenuOpen ? '✕' : '☰'}</span>
        </button>
        <div className={`nav-links-wrapper${isMobileMenuOpen ? ' open' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '0.5rem' }}>
          <a 
            href="#home" 
            className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
          >
            Home
          </a>
          <a 
            href="#features" 
            className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavClick('features'); }}
          >
            Features
          </a>
          <a 
            href="#about" 
            className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}
          >
            About
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={onAuthClick}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                color: '#4f46e5',
                fontSize: '1rem',
                fontWeight: '500',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e0e7ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Login/Register
            </button>
            <a 
              href="#try" 
              className={`nav-link ${activeSection === 'try' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); onStartLearning(); }}
            >
              Try LearnPath Now
            </a>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '1rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '1.75rem', height: '1.75rem', color: '#1f2937' }}>
                {isDarkMode ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 