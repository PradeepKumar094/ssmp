import React from 'react';

interface HeroSectionProps {
  onStartLearning: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStartLearning }) => {
  return (
    <section id="home" className="hero-section">
      <div
        className="container hero-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2.5rem',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            width: '100%',
            maxWidth: '600px',
            marginBottom: '2rem',
          }}
          className="hero-text"
        >
          <h1
            className="fade-in-up"
            style={{
              fontSize: '3rem',
              fontWeight: 800,
              lineHeight: '1.2',
              marginBottom: '1.5rem',
              color: 'white',
              textAlign: 'left',
            }}
          >
            Your Journey to Mastery with{' '}
            <span style={{ color: '#2dd4bf' }}>AI-Powered</span> Learning
          </h1>
          <p
            style={{
              fontSize: '1.25rem',
              marginBottom: '2rem',
              color: '#e5e7eb',
              textAlign: 'left',
            }}
          >
            Discover a tailored learning experience designed to unlock your full potential with AI-powered personalization.
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              className="btn-primary"
              style={{
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '9999px',
                fontSize: '1.125rem',
                fontWeight: 500,
              }}
              onClick={onStartLearning}
            >
              Get Started
            </button>
          </div>
        </div>
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }} className="hero-image">
          <div className="image-container">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Students collaborating"
              style={{ width: '100%', height: '24rem', objectFit: 'cover', borderRadius: '0.75rem' }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '-1.5rem',
              right: '-1.5rem',
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite',
                }}
              ></div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1f2937' }}>
                50,000+ Active Learners
              </span>
            </div>
          </div>
        </div>
        <style>{`
          @media (min-width: 900px) {
            .hero-content {
              flex-direction: row !important;
              align-items: center !important;
              justify-content: space-between !important;
              gap: 3rem !important;
            }
            .hero-text {
              text-align: left !important;
              max-width: 600px !important;
              width: 50% !important;
              margin-bottom: 0 !important;
            }
            .hero-image {
              width: 50% !important;
              max-width: 500px !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
};

export default HeroSection; 