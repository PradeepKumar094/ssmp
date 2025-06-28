import React, { useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'student';
}

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState<'home' | 'students' | 'support'>('home');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleThemeToggle = () => setDarkMode((prev) => !prev);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showProfileDropdown]);

  return (
    <div className={darkMode ? 'dark' : ''} style={{ minHeight: '100vh', background: darkMode ? '#18181b' : '#f3f4f6' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 40px',
        background: darkMode ? '#27272a' : '#fff',
        borderBottom: '1px solid #e5e7eb',
        position: 'relative',
      }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: darkMode ? '#fff' : '#18181b' }}>LearnPath</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <button onClick={() => setActivePage('home')} style={{
            background: activePage === 'home' ? (darkMode ? '#18181b' : '#e0e7ff') : 'none',
            color: activePage === 'home' ? '#6366f1' : (darkMode ? '#fff' : '#18181b'),
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            outline: 'none',
            transition: 'background 0.2s',
          }}>Home</button>
          <button onClick={() => setActivePage('students')} style={{
            background: activePage === 'students' ? (darkMode ? '#18181b' : '#e0e7ff') : 'none',
            color: activePage === 'students' ? '#6366f1' : (darkMode ? '#fff' : '#18181b'),
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            outline: 'none',
            transition: 'background 0.2s',
          }}>Students</button>
          <button onClick={() => setActivePage('support')} style={{
            background: activePage === 'support' ? (darkMode ? '#18181b' : '#e0e7ff') : 'none',
            color: activePage === 'support' ? '#6366f1' : (darkMode ? '#fff' : '#18181b'),
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            outline: 'none',
            transition: 'background 0.2s',
          }}>Support</button>
          {/* Theme toggle icon */}
          <button onClick={handleThemeToggle} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 22,
            color: darkMode ? '#fff' : '#18181b',
            marginLeft: 8,
          }} title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            {darkMode ? '🌙' : '☀️'}
          </button>
          {/* Profile dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProfileDropdown((prev) => !prev)}
              style={{
                background: 'none',
                border: '2px solid #6366f1',
                borderRadius: '50%',
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
                color: '#6366f1',
                marginLeft: 8,
                cursor: 'pointer',
              }}
              title="Profile"
              className="profile-dropdown"
            >
              {user.username.charAt(0).toUpperCase()}
            </button>
            {showProfileDropdown && (
              <div className="profile-dropdown" style={{
                position: 'absolute',
                right: 0,
                top: 50,
                background: darkMode ? '#27272a' : '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                minWidth: 180,
                zIndex: 10,
                padding: 8,
              }}>
                <button style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: darkMode ? '#fff' : '#18181b',
                  fontWeight: 600,
                  fontSize: 15,
                  padding: '10px 0',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderBottom: '1px solid #e5e7eb',
                }}>My Profile</button>
                <button onClick={onLogout} style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontWeight: 600,
                  fontSize: 15,
                  padding: '10px 0',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        maxWidth: 900,
        margin: '60px auto 0',
        background: darkMode ? '#23232a' : '#fff',
        borderRadius: 18,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '60px 40px',
        minHeight: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Home Page */}
        {activePage === 'home' && (
          <>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: darkMode ? '#fff' : '#18181b', marginBottom: 24 }}>Welcome Back</h1>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#6366f1', marginBottom: 12 }}>Admin name</div>
              <div style={{ fontSize: 18, color: darkMode ? '#fff' : '#18181b' }}>{user.username}</div>
            </div>
            <div>
              {/* Placeholder for admin image */}
              <div style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 54,
                color: '#6366f1',
                fontWeight: 700,
                boxShadow: '0 2px 12px rgba(99,102,241,0.08)'
              }}>{user.username.charAt(0).toUpperCase()}</div>
            </div>
          </>
        )}
        {/* Students Page */}
        {activePage === 'students' && (
          <div style={{ width: '100%' }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: darkMode ? '#fff' : '#18181b', marginBottom: 24 }}>All Students</h2>
            {/* TODO: Implement students table here */}
            <div style={{ color: '#6b7280', fontSize: 18 }}>Student details will be displayed here.</div>
          </div>
        )}
        {/* Support Page */}
        {activePage === 'support' && (
          <div style={{ width: '100%' }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: darkMode ? '#fff' : '#18181b', marginBottom: 24 }}>Support Queries</h2>
            {/* TODO: Implement support queries here */}
            <div style={{ color: '#6b7280', fontSize: 18 }}>Student queries and admin replies will be displayed here.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 