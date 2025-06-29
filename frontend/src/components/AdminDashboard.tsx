import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserProfile from './UserProfile';
import ChatSupport from './ChatSupport';
import { useWebSocket } from '../contexts/WebSocketContext';
import { API_ENDPOINTS } from '../config/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'student';
  topics?: string[];
  prerequisites?: { topic: string; prerequisites: string[] }[];
  quizScores?: { topic: string; score: number; date: string }[];
  learningPaths?: { topic: string; weeks: number; level: string; durationPerDay: string; path: any[]; generatedAt: string }[];
  avatar?: string;
}

interface Chat {
  _id: string;
  studentId: { username: string; email: string };
  adminId?: { username: string; email: string };
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
  messages: Array<{
    sender: 'student' | 'admin';
    message: string;
    timestamp: string;
  }>;
  createdAt: string;
  lastMessageAt: string;
}

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState<'home' | 'students' | 'support'>('home');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [students, setStudents] = useState<User[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  // Support chat state
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [newChatNotification, setNewChatNotification] = useState(false);
  
  // Professional chat support state
  const [showChatSupport, setShowChatSupport] = useState(false);
  const [initialChatId, setInitialChatId] = useState<string | null>(null);

  const { socket, isConnected } = useWebSocket();

  const handleThemeToggle = () => setDarkMode((prev) => !prev);

  const handleOpenChatSupport = () => {
    setShowChatSupport(true);
  };

  const handleCloseChatSupport = () => {
    setShowChatSupport(false);
    setInitialChatId(null);
  };

  // WebSocket event listeners for real-time chat
  useEffect(() => {
    if (!socket) return;

    // Listen for new chat requests
    socket.on('new_chat_request', (data: { chat: Chat }) => {
      setChats(prev => [data.chat, ...prev]);
      setNewChatNotification(true);
      
      // Show notification effect
      showNotificationEffect();
      
      // Auto-switch to support page if not already there
      if (activePage !== 'support') {
        setActivePage('support');
      }
    });

    // Listen for new messages in existing chats
    socket.on('new_chat_message', (data: { chatId: string; message: any; chat: Chat }) => {
      setChats(prev => prev.map(chat => 
        chat._id === data.chatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, data.message],
              lastMessageAt: data.message.timestamp
            }
          : chat
      ));
      
      // Update selected chat if it's the current one
      if (selectedChat?._id === data.chatId) {
        setSelectedChat(prev => prev ? {
          ...prev,
          messages: [...prev.messages, data.message],
          lastMessageAt: data.message.timestamp
        } : null);
      }

      // Show notification effect
      showNotificationEffect();
    });

    return () => {
      socket.off('new_chat_request');
      socket.off('new_chat_message');
    };
  }, [socket, selectedChat, activePage]);

  const showNotificationEffect = () => {
    // Create a notification sound effect (optional)
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audio.play().catch(() => {}); // Ignore errors if audio fails to play
  };

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

  // Fetch students when students page is active
  useEffect(() => {
    if (activePage === 'students') {
      setLoadingStudents(true);
      setStudentsError('');
      axios.get(API_ENDPOINTS.USERS, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => {
          setStudents(res.data.filter((u: User) => u.role === 'student'));
        })
        .catch(() => setStudentsError('Failed to fetch students'))
        .finally(() => setLoadingStudents(false));
    }
  }, [activePage]);

  // Fetch chats when support page is active
  useEffect(() => {
    if (activePage === 'support') {
      fetchChats();
    }
  }, [activePage]);

  const fetchChats = async () => {
    try {
      setLoadingChats(true);
      const response = await axios.get(API_ENDPOINTS.CHAT, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedChat) return;
    
    if (socket && isConnected) {
      // Use WebSocket for real-time messaging
      socket.emit('send_message', {
        chatId: selectedChat._id,
        message: chatInput
      });
      
      // Add message optimistically
      const newMessage = {
        sender: 'admin' as const,
        message: chatInput,
        timestamp: new Date().toISOString()
      };
      
      setChats(prev => prev.map(chat => 
        chat._id === selectedChat._id 
          ? { 
              ...chat, 
              messages: [...chat.messages, newMessage],
              lastMessageAt: newMessage.timestamp
            }
          : chat
      ));
      
      setSelectedChat(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMessage],
        lastMessageAt: newMessage.timestamp
      } : null);
      
      setChatInput('');
    } else {
      // Fallback to REST API
      try {
        const response = await axios.post(API_ENDPOINTS.CHAT_MESSAGES(selectedChat._id), {
          message: chatInput
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        setChats(prev => prev.map(chat => 
          chat._id === selectedChat._id ? response.data : chat
        ));
        setSelectedChat(response.data);
        setChatInput('');
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      }
    }
  };

  const handleCloseChat = async (chatId: string) => {
    try {
      const response = await axios.put(API_ENDPOINTS.CHAT_CLOSE(chatId), {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setChats(prev => prev.map(chat => 
        chat._id === chatId ? response.data : chat
      ));
      if (selectedChat?._id === chatId) {
        setSelectedChat(response.data);
      }
    } catch (error) {
      console.error('Error closing chat:', error);
      alert('Failed to close chat. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={darkMode ? 'dark' : ''} style={{ minHeight: '100vh', background: 'linear-gradient(90deg, #6366f1 0%, #2dd4bf 100%)' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 40px',
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        position: 'relative',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: '#18181b' }}>LearnPath</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <button onClick={() => setActivePage('home')} style={{
            background: activePage === 'home' ? '#e0e7ff' : 'none',
            color: activePage === 'home' ? '#6366f1' : '#18181b',
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
            background: activePage === 'students' ? '#e0e7ff' : 'none',
            color: activePage === 'students' ? '#6366f1' : '#18181b',
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            outline: 'none',
            transition: 'background 0.2s',
          }}>Students</button>
          <button onClick={handleOpenChatSupport} style={{
            background: activePage === 'support' ? '#e0e7ff' : 'none',
            color: activePage === 'support' ? '#6366f1' : '#18181b',
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            outline: 'none',
            transition: 'background 0.2s',
            position: 'relative',
          }}>
            Support
            {newChatNotification && (
              <span style={{
                position: 'absolute',
                top: -5,
                right: -5,
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                animation: 'pulse 2s infinite',
              }}>
                !
              </span>
            )}
          </button>
          {/* Theme toggle icon */}
          <button onClick={handleThemeToggle} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 22,
            color: '#6366f1',
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
                overflow: 'hidden',
                padding: 0
              }}
              title="Profile"
              className="profile-dropdown"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </button>
            {showProfileDropdown && (
              <div className="profile-dropdown" style={{
                position: 'absolute',
                right: 0,
                top: 50,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                minWidth: 180,
                zIndex: 10,
                padding: 8,
              }}>
                <button onClick={() => { setShowProfile(true); setShowProfileDropdown(false); }} style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: '#18181b',
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
        maxWidth: 700,
        margin: '60px auto 0',
        background: 'none',
        borderRadius: 18,
        boxShadow: 'none',
        padding: '0',
        minHeight: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Home Page */}
        {activePage === 'home' && (
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 420,
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 18,
              boxShadow: '0 8px 32px rgba(99,102,241,0.10)',
              padding: '48px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 340,
              maxWidth: 420,
              width: '100%',
              margin: '0 auto',
            }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: '#18181b',
                marginBottom: '1.5rem',
                letterSpacing: '-1px',
                textShadow: '0 2px 8px rgba(99,102,241,0.08)'
              }}>
                Welcome Back, <span style={{ color: '#10b981' }}>Admin</span>
              </h1>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                width: '100%'
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: '#e0e7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 38,
                  color: '#6366f1',
                  fontWeight: 700,
                  boxShadow: '0 2px 12px rgba(99,102,241,0.08)',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#18181b', marginBottom: 6 }}>{user.username}</div>
                  <div style={{ fontSize: 16, color: '#6366f1', marginBottom: 2 }}>{user.email}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Admin</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Students Page */}
        {activePage === 'students' && (
          <div style={{ width: '100%' }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: darkMode ? '#fff' : '#18181b', marginBottom: 24 }}>All Students</h2>
            {loadingStudents ? (
              <div style={{ color: '#6b7280', fontSize: 18 }}>Loading students...</div>
            ) : studentsError ? (
              <div style={{ color: '#dc2626', fontSize: 18 }}>{studentsError}</div>
            ) : students.length === 0 ? (
              <div style={{
                color: darkMode ? '#fff' : '#64748b',
                fontSize: 20,
                textAlign: 'center',
                margin: '48px 0',
                fontWeight: 500
              }}>No students found.</div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: 12, boxShadow: darkMode ? '0 2px 12px rgba(0,0,0,0.18)' : '0 2px 12px rgba(99,102,241,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: darkMode ? '#18181b' : '#fff', borderRadius: 10, minWidth: 900 }}>
                  <thead>
                    <tr style={{ background: darkMode ? '#23232a' : '#e0e7ff', color: darkMode ? '#fff' : '#6366f1' }}>
                      <th style={{ padding: 14, textAlign: 'left' }}>User ID</th>
                      <th style={{ padding: 14, textAlign: 'left' }}>Username</th>
                      <th style={{ padding: 14, textAlign: 'left' }}>Email</th>
                      <th style={{ padding: 14, textAlign: 'left' }}>Password</th>
                      <th style={{ padding: 14, textAlign: 'left' }}>Topics</th>
                      <th style={{ padding: 14, textAlign: 'left' }}>Prerequisites</th>
                      <th style={{ padding: 14, textAlign: 'left' }}>Quiz Marks</th>
                      <th style={{ padding: 14, textAlign: 'left' }}>Learning Path</th>
                      <th style={{ padding: 14, textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #e5e7eb', color: darkMode ? '#fff' : '#18181b' }}>
                        <td style={{ padding: 12, fontFamily: 'monospace', fontSize: 13 }}>{s.id}</td>
                        <td style={{ padding: 12 }}>{s.username}</td>
                        <td style={{ padding: 12 }}>{s.email}</td>
                        <td style={{ padding: 12 }}>••••••••</td>
                        <td style={{ padding: 12 }}>{Array.isArray(s.topics) ? s.topics.join(', ') : ''}</td>
                        <td style={{ padding: 12 }}>
                          <button style={{ background: darkMode ? '#23232a' : '#e0e7ff', color: '#6366f1', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 600, cursor: 'pointer', fontSize: 13, marginRight: 6 }}>Edit</button>
                          {Array.isArray(s.prerequisites) ? s.prerequisites.map((p: any) => p.topic).join(', ') : ''}
                        </td>
                        <td style={{ padding: 12 }}>{Array.isArray(s.quizScores) ? s.quizScores.map((q: any) => `${q.topic}: ${q.score}`).join(', ') : ''}</td>
                        <td style={{ padding: 12 }}>{Array.isArray(s.learningPaths) ? s.learningPaths.map((lp: any) => lp.topic).join(', ') : ''}</td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <button style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* Support Page */}
        {activePage === 'support' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: 600 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: darkMode ? '#fff' : '#18181b', marginBottom: 24 }}>Support Queries</h2>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              {/* Chat List */}
              <div style={{
                width: 300,
                borderRight: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Active Chats</h3>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>
                    {chats.filter(c => c.status !== 'closed').length} open
                  </div>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {loadingChats ? (
                    <div style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>
                      Loading chats...
                    </div>
                  ) : chats.length === 0 ? (
                    <div style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>
                      No support requests yet.
                    </div>
                  ) : (
                    chats.map(chat => (
                      <div
                        key={chat._id}
                        onClick={() => setSelectedChat(chat)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f3f4f6',
                          cursor: 'pointer',
                          background: selectedChat?._id === chat._id ? '#e0e7ff' : 'transparent',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                          {chat.subject}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                          {chat.studentId.username}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>
                          {chat.status} • {formatDate(chat.lastMessageAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedChat ? (
                  <>
                    <div style={{
                      padding: 16,
                      borderBottom: '1px solid #e5e7eb',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                          {selectedChat.subject}
                        </h3>
                        <div style={{ fontSize: 14, color: '#6b7280' }}>
                          {selectedChat.studentId.username} • {selectedChat.status}
                        </div>
                      </div>
                      {selectedChat.status !== 'closed' && (
                        <button
                          onClick={() => handleCloseChat(selectedChat._id)}
                          style={{
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: 13,
                          }}
                        >
                          Close Chat
                        </button>
                      )}
                    </div>
                    
                    <div style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: 16,
                      background: '#f9fafb',
                    }}>
                      {selectedChat.messages.map((message, index) => (
                        <div
                          key={index}
                          style={{
                            marginBottom: 12,
                            textAlign: message.sender === 'admin' ? 'right' : 'left',
                          }}
                        >
                          <div style={{
                            display: 'inline-block',
                            background: message.sender === 'admin' ? '#6366f1' : '#e0e7ff',
                            color: message.sender === 'admin' ? '#fff' : '#18181b',
                            borderRadius: 12,
                            padding: '12px 16px',
                            maxWidth: '70%',
                            fontSize: 14,
                          }}>
                            {message.message}
                          </div>
                          <div style={{
                            fontSize: 11,
                            color: '#6b7280',
                            marginTop: 4,
                            textAlign: message.sender === 'admin' ? 'right' : 'left',
                          }}>
                            {formatDate(message.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {selectedChat.status !== 'closed' && (
                      <div style={{
                        padding: 16,
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        gap: 8,
                      }}>
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type your response..."
                          style={{
                            flex: 1,
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: 8,
                            fontSize: 14,
                          }}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!chatInput.trim()}
                          style={{
                            background: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 20px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            opacity: !chatInput.trim() ? 0.5 : 1,
                          }}
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280',
                    fontSize: 16,
                  }}>
                    Select a chat to respond
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Profile Modal */}
      {showProfile && (
        <UserProfile user={user} onLogout={onLogout} onClose={() => setShowProfile(false)} />
      )}
      
      {/* Professional Chat Support */}
      {showChatSupport && (
        <ChatSupport onClose={handleCloseChatSupport} initialChatId={initialChatId || undefined} userRole="admin" />
      )}
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard; 