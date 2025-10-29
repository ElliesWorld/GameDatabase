import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Profile from './profile';
import User from './user';
import GameSelection from './game';
import Play from './play';
import Statistics from './statistics';
import api from './services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  profilePicture?: string;
}

interface Weather {
  location: string;
  temperature: number;
  icon: string;
  condition: string;
  date: string;
}

// Home component - User list
function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

    // Fetch weather
    api.get('/weather')
      .then(response => {
        const weatherData = response.data.data || response.data;
        setWeather(weatherData);
      })
      .catch(error => {
        console.error('Error fetching weather:', error);
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
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Top Navigation Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'white',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 200
      }}>
        {/* Left side - Weather */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {weather && (
            <>
              <span style={{ fontSize: '2rem' }}>{weather.icon}</span>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {weather.date}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea' }}>
                  {weather.temperature}°C
                </div>
              </div>
            </>
          )}
        </div>

        {/* Center - Search (placeholder) */}
        <div style={{
          flex: 1,
          maxWidth: '400px',
          margin: '0 20px'
        }}>
          <input
            type="text"
            placeholder="search"
            style={{
              width: '100%',
              padding: '10px 15px',
              border: '2px solid #e0e0e0',
              borderRadius: '25px',
              fontSize: '1rem'
            }}
            readOnly
          />
        </div>

        <div style={{ width: '150px' }}></div>
      </div>

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: '70px',
        width: '60px',
        height: 'calc(100vh - 70px)',
        background: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '20px',
        gap: '30px',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        zIndex: 100
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px',
            color: '#667eea',
            fontSize: '0.7rem',
            fontWeight: 'bold'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>👤</span>
          <span>users</span>
        </button>
        
        <button
          onClick={() => navigate('/statistics')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px',
            color: '#666',
            fontSize: '0.7rem'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>📊</span>
          <span>stats</span>
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: '60px',
        marginTop: '70px',
        padding: '40px',
        overflowY: 'auto'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          {/* Header with Title and Add User Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div>
              <h1 style={{ marginBottom: '10px' }}>Select User</h1>
              <h2 style={{ marginBottom: '0', color: '#666', fontSize: '1.2rem' }}>
                Choose a user to view their profile
              </h2>
            </div>
            
            {/* Add User Button */}
            <button
              onClick={() => navigate('/user')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '15px 25px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102,126,234,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)';
              }}
            >
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>+</span>
              <span>Add User</span>
            </button>
          </div>
          
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
                  onClick={() => navigate(`/profile/${user.id}`)}
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
                    {user.profilePicture || '👤'}
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
    </div>
  );
}

// Main App component with Router
function Home() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserList />} />
        <Route path="/user" element={<User />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/game/:userId" element={<GameSelection />} />
        <Route path="/play/:userId/:gameId" element={<Play />} />
        <Route path="/statistics" element={<Statistics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Home;