import React from 'react';

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onStartLearning: () => void;
  onAuthClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleTheme, onStartLearning, onAuthClick }) => {
  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#4f46e5' }}>LearnPath</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '0.5rem' }}>
          <a href="#home" className="nav-link active">Home</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#about" className="nav-link">About</a>
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
            <a href="#try" className="nav-link" onClick={(e) => { e.preventDefault(); onStartLearning(); }}>Try LearnPath Now</a>
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