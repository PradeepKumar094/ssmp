import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users');
        setUsers(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', color: '#4f46e5', fontWeight: 700 }}>Admin Dashboard</h1>
        <button
          onClick={onLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b91c1c')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#dc2626')}
        >
          Logout
        </button>
      </div>
      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p style={{ color: '#dc2626' }}>{error}</p>
      ) : (
        <table style={{ width: '100%', background: 'white', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <thead style={{ background: '#6366f1', color: 'white' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left' }}>Username</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>User ID</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px' }}>{u.username}</td>
                <td style={{ padding: '16px' }}>{u.email}</td>
                <td style={{ padding: '16px', textTransform: 'capitalize' }}>{u.role}</td>
                <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '13px' }}>{u.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard; 