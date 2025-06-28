import React from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'student';
}

interface UserProfileProps {
  user: User;
  onLogout: () => void;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          ×
        </button>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: user.role === 'admin' ? '#dc2626' : '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '32px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h2 style={{
            color: '#1f2937',
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            {user.username}
          </h2>
          <span style={{
            backgroundColor: user.role === 'admin' ? '#fef2f2' : '#eef2ff',
            color: user.role === 'admin' ? '#dc2626' : '#6366f1',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            {user.role}
          </span>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#6b7280',
              fontWeight: '600',
              fontSize: '12px',
              textTransform: 'uppercase'
            }}>
              Email
            </label>
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '16px',
              color: '#374151'
            }}>
              {user.email}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#6b7280',
              fontWeight: '600',
              fontSize: '12px',
              textTransform: 'uppercase'
            }}>
              User ID
            </label>
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#6b7280',
              fontFamily: 'monospace'
            }}>
              {user.id}
            </div>
          </div>

          {user.role === 'admin' && (
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>👑</span>
                <span style={{
                  fontWeight: '600',
                  color: '#92400e',
                  fontSize: '14px'
                }}>
                  Admin Privileges
                </span>
              </div>
              <p style={{
                color: '#92400e',
                fontSize: '12px',
                margin: 0,
                lineHeight: '1.4'
              }}>
                You have access to administrative features and can manage the learning platform.
              </p>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          >
            Close
          </button>
          <button
            onClick={onLogout}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 