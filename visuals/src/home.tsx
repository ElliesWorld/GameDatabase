import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Profile from './profile';
import api from './services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  profilePicture?: string;
}

// User List Component (inner component)
function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // ← Add navigation hook

  useEffect(() => {
    api.get('/users')
      .then(response => {
        console.log('Full response:', response.data);
        
        let userData: User[] = [];
        
        if (Array.isArray(response.data)) {
          userData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          userData = response.data.data;
        }
        
        console.log('Parsed users:', userData);
        setUsers(userData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>⏳ Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <h1>❌ Error: {error}</h1>
        <p>Make sure your backend is running on http://localhost:3000</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '40px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginBottom: '10px' }}>🎮 Game Platform</h1>
        <h2 style={{ marginBottom: '20px', color: '#666' }}>
          Users from Database: {users.length}
        </h2>
        
        {users.length === 0 ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            background: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <h3>📭 No users yet!</h3>
            <p>Run <code>npm run seed</code> in your backend to add sample data</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {users.map(user => (
              <div 
                key={user.id}
                onClick={() => navigate(`/profile/${user.id}`)}  // ← ADD THIS - Navigate to profile
                style={{
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  background: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                  👤
                </div>
                <h3 style={{ margin: '10px 0', color: '#333' }}>
                  {user.nickname}
                </h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  {user.firstName} {user.lastName}
                </p>
                <p style={{ color: '#999', fontSize: '0.85rem', marginTop: '5px' }}>
                  {user.email}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Main Home component with Router (outer component)
function Home() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserList />} />
        <Route path="/profile/:userId" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Home; 