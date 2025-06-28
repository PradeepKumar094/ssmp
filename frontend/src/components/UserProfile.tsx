import React, { useState, useRef } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'student';
  avatar?: string;
}

interface UserProfileProps {
  user: User;
  onLogout: () => void;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onClose }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: user.username, password: '' });
  const [avatar, setAvatar] = useState<string | null>(user.avatar || null); // base64 or url
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dark] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.put(`http://localhost:5000/api/auth/users/${user.id}`, {
        username: formData.username,
        password: formData.password || undefined,
        avatar
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Profile updated!');
      setEditMode(false);
      setFormData({ ...formData, password: '' });
      // Update localStorage and reload user in app
      localStorage.setItem('user', JSON.stringify(response.data));
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: dark ? 'rgba(24,24,27,0.95)' : 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '10px',
      transition: 'background 0.3s'
    }}>
      <div style={{
        backgroundColor: dark ? '#23232a' : 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '340px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        color: dark ? '#fff' : '#18181b',
        transition: 'background 0.3s, color 0.3s'
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
            color: dark ? '#fff' : '#666',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = dark ? '#18181b' : '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          ×
        </button>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#e0e7ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '32px',
            color: '#6366f1',
            fontWeight: 'bold',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {(avatar || user.avatar) ? (
              <img src={avatar || user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
            {editMode && (avatar || user.avatar) && (
              <button onClick={handleRemoveAvatar} style={{ position: 'absolute', top: 2, right: 2, background: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, color: '#dc2626', fontWeight: 700, cursor: 'pointer', fontSize: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>×</button>
            )}
          </div>
          {editMode && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              <button onClick={() => fileInputRef.current?.click()} style={{ background: dark ? '#18181b' : '#e0e7ff', color: dark ? '#fff' : '#6366f1', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 600, fontSize: 14, marginBottom: 10, cursor: 'pointer', marginRight: 8 }}>Upload Photo</button>
              {avatar && <button onClick={handleRemoveAvatar} style={{ background: dark ? '#18181b' : '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 600, fontSize: 14, marginBottom: 10, cursor: 'pointer' }}>Remove</button>}
            </>
          )}
          <h2 style={{
            color: dark ? '#fff' : '#1f2937',
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            {user.username}
          </h2>
          <span style={{
            backgroundColor: user.role === 'admin' ? (dark ? '#27272a' : '#fef2f2') : (dark ? '#23232a' : '#eef2ff'),
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
        <div style={{ marginBottom: '18px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: dark ? '#e5e7eb' : '#6b7280',
            fontWeight: '600',
            fontSize: '12px',
            textTransform: 'uppercase'
          }}>
            Email
          </label>
          <div style={{
            padding: '12px 16px',
            backgroundColor: dark ? '#23232a' : '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '16px',
            color: dark ? '#fff' : '#374151',
            marginBottom: 10
          }}>{user.email}</div>
        </div>
        <div style={{ marginBottom: '18px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: dark ? '#e5e7eb' : '#6b7280',
            fontWeight: '600',
            fontSize: '12px',
            textTransform: 'uppercase'
          }}>
            Username
          </label>
          {editMode ? (
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                marginBottom: 0
              }}
            />
          ) : (
            <div style={{
              padding: '12px 16px',
              backgroundColor: dark ? '#23232a' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '16px',
              color: dark ? '#fff' : '#374151'
            }}>{user.username}</div>
          )}
        </div>
        <div style={{ marginBottom: '18px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: dark ? '#e5e7eb' : '#6b7280',
            fontWeight: '600',
            fontSize: '12px',
            textTransform: 'uppercase'
          }}>
            Password
          </label>
          {editMode ? (
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                marginBottom: 0
              }}
              placeholder="Enter new password"
            />
          ) : (
            <div style={{
              padding: '12px 16px',
              backgroundColor: dark ? '#23232a' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '16px',
              color: dark ? '#fff' : '#374151',
              letterSpacing: '0.2em'
            }}>••••••••</div>
          )}
        </div>
        <div style={{ marginBottom: '18px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: dark ? '#e5e7eb' : '#6b7280',
            fontWeight: '600',
            fontSize: '12px',
            textTransform: 'uppercase'
          }}>
            User ID
          </label>
          <div style={{
            padding: '12px 16px',
            backgroundColor: dark ? '#23232a' : '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            color: dark ? '#fff' : '#6b7280',
            fontFamily: 'monospace'
          }}>{user.id}</div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => { setEditMode(false); setFormData({ username: user.username, password: '' }); setAvatar(null); setError(''); setSuccess(''); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: dark ? '#23232a' : '#f3f4f6',
                  color: dark ? '#fff' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Edit Profile
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
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: dark ? '#23232a' : '#f3f4f6',
                  color: dark ? '#fff' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Close
              </button>
            </>
          )}
        </div>
        {error && <div style={{ color: '#dc2626', marginTop: 16 }}>{error}</div>}
        {success && <div style={{ color: '#16a34a', marginTop: 16 }}>{success}</div>}
      </div>
    </div>
  );
};

export default UserProfile; 