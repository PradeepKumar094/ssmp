import React from 'react';

interface CallToActionSectionProps {
  onStartLearning: () => void;
  isDarkMode?: boolean;
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({ onStartLearning, isDarkMode = false }) => {
  return (
    <section id="try" style={{
      padding: '6rem 0',
      backgroundColor: isDarkMode ? 'var(--bg-dark)' : 'white',
      color: isDarkMode ? 'var(--text-color-dark)' : '#1f2937',
      textAlign: 'center'
    }}>
      <div className="container">
        <div className="cta-section-content">
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '1.5rem' }}>Ready to Start Your Learning Journey?</h2>
          <p style={{ fontSize: '1.25rem', color: isDarkMode ? '#94a3af' : '#6b7280', marginBottom: '2.5rem' }}>
            Sign up for free and experience the future of personalized education.
          </p>
          <button className="btn-primary" style={{ color: 'white', padding: '1.25rem 2.5rem', borderRadius: '9999px', fontSize: '1.25rem', fontWeight: '500' }} onClick={onStartLearning}>
            Get Started for Free
          </button>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection; 