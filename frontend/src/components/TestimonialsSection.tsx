import React from 'react';

interface TestimonialsSectionProps {
  isDarkMode?: boolean;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ isDarkMode = false }) => {
  return (
    <section id="testimonials" style={{
      padding: '6rem 0',
      backgroundColor: isDarkMode ? '#2d3748' : '#f9fafb',
      color: isDarkMode ? 'var(--text-color-dark)' : '#1f2937'
    }}>
      <div className="container">
        <h2 style={{ fontSize: '2.25rem', fontWeight: '800', textAlign: 'center', marginBottom: '4rem' }}>What Our Learners Say</h2>
        <div className="testimonials-section-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="testimonial-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1.125rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>"LearnPath transformed my understanding of complex topics. The personalized approach kept me motivated and engaged!"</p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="John Doe" style={{ width: '4rem', height: '4rem', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.75rem', border: '4px solid #6366f1' }} />
                <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>John Doe</p>
                <p style={{ color: isDarkMode ? '#94a3af' : '#6b7280' }}>Software Engineer</p>
              </div>
            </div>
            
            <div className="testimonial-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1.125rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>"The interactive lessons and real-time progress tracking made learning enjoyable and effective. Highly recommend!"</p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Jane Smith" style={{ width: '4rem', height: '4rem', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.75rem', border: '4px solid #6366f1' }} />
                <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>Jane Smith</p>
                <p style={{ color: isDarkMode ? '#94a3af' : '#6b7280' }}>Student</p>
              </div>
            </div>
            
            <div className="testimonial-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1.125rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>"As a busy professional, I needed a flexible learning solution. LearnPath delivered exactly what I needed!"</p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src="https://randomuser.me/api/portraits/men/67.jpg" alt="Mike Johnson" style={{ width: '4rem', height: '4rem', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.75rem', border: '4px solid #6366f1' }} />
                <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>Mike Johnson</p>
                <p style={{ color: isDarkMode ? '#94a3af' : '#6b7280' }}>Product Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 