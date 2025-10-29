import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './services/api';

interface GameStat {
  minutes: number;
  percentage: number;
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  profilePicture?: string;
  statistics: {
    gameStats: {
      [gameName: string]: GameStat;
    };
    totalMinutes: number;
    totalSessions: number;
  };
}

interface Weather {
  location: string;
  temperature: number;
  icon: string;
  condition: string;
  date: string;
}

function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch user profile with statistics
    api.get(`/users/${userId}`)
      .then(response => {
        console.log('User profile:', response.data);
        const userData = response.data.data || response.data;
        setUser(userData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
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
  }, [userId]);

  if (loading) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{ color: 'white', fontSize: '2rem' }}>⏳ Loading...</h1>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h1 style={{ color: 'white', fontSize: '2rem' }}>❌ Error: {error || 'User not found'}</h1>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '15px 30px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}
        >
          Back to Home
        </button>
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
            color: '#666',
            fontSize: '0.7rem'
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

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        marginLeft: '60px',
        marginTop: '70px',
        padding: '40px 20px',
        width: '100%'
      }}>
        
        {/* Main Profile Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '50px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          
          {/* User Icons Row at Top */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px',
            paddingBottom: '30px',
            borderBottom: '2px solid #e0e0e0'
          }}>

            {/* User Icons (placeholder for multiple users) */}
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div 
                key={num}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: num === 1 ? '#667eea' : '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  border: num === 1 ? '3px solid #764ba2' : 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {user.profilePicture || '👤'}
              </div>
            ))}
            
            <button
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'none',
                border: 'none',
                fontSize: '2.5rem',
                cursor: 'pointer'
              }}
            >
              ➡
            </button>
          </div>

          {/* Profile Content Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '350px 1fr',
            gap: '60px',
            alignItems: 'start'
          }}>
            
            {/* Left Column - Profile Picture */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100%',
                aspectRatio: '1',
                background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12rem',
                marginBottom: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {user.profilePicture || '👤'}
              </div>
              <h2 style={{ 
                fontSize: '2rem', 
                margin: '20px 0 10px 0',
                color: '#333'
              }}>
                {user.firstName} {user.lastName}
              </h2>
              <p style={{ 
                color: '#666',
                fontSize: '1.1rem',
                marginBottom: '10px'
              }}>
                @{user.nickname}
              </p>
            </div>

            {/* Right Column - Game Statistics */}
            <div>
              
              {/* Game Progress Bars with Minutes */}
              <div style={{ marginBottom: '40px' }}>
                {user.statistics?.gameStats && Object.entries(user.statistics.gameStats).map(([gameName, stat]) => {
                  // Get icon based on game name
                  let icon = '🎮';
                  if (gameName.includes('Snowball')) icon = '❄️';
                  if (gameName.includes('Bear')) icon = '🐻';
                  if (gameName.includes('Meteor')) icon = '☄️';
                  if (gameName.includes('Tarzan')) icon = '🌴';

                  const minutes = stat.minutes || 0;
                  const percentage = stat.percentage || 0;
                  
                  return (
                    <div key={gameName} style={{ marginBottom: '25px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                      }}>
                        <span style={{ 
                          fontWeight: 'bold',
                          fontSize: '1.2rem',
                          color: '#333',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                          {gameName}
                        </span>
                        <span style={{ 
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          color: '#667eea'
                        }}>
                          {minutes} min
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '50px',
                        background: '#e0e0e0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #667eea, #764ba2)',
                          transition: 'width 0.5s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          paddingRight: '15px'
                        }}>
                          <span style={{
                            fontWeight: 'bold',
                            color: 'white',
                            fontSize: '1.1rem'
                          }}>
                            {percentage > 5 && `${percentage}%`}
                          </span>
                        </div>
                        {percentage <= 5 && (
                          <span style={{
                            position: 'absolute',
                            right: '15px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontWeight: 'bold',
                            color: '#333',
                            fontSize: '1.1rem'
                          }}>
                            {percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Game Icons with Circular Percentage */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
                marginBottom: '40px'
              }}>
                {user.statistics?.gameStats && Object.entries(user.statistics.gameStats).map(([gameName, stat]) => {
                  // Get icon based on game name
                  let icon = '🎮';
                  if (gameName.includes('Snowball')) icon = '❄️';
                  if (gameName.includes('Bear')) icon = '🐻';
                  if (gameName.includes('Meteor')) icon = '☄️';
                  if (gameName.includes('Tarzan')) icon = '🌴';

                  const percentage = stat.percentage || 0;
                  
                  return (
                    <div key={gameName} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      padding: '20px',
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      transition: 'transform 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <span style={{ fontSize: '3.5rem' }}>{icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          color: '#333',
                          marginBottom: '5px'
                        }}>
                          {gameName}
                        </div>
                      </div>
                      <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        border: '4px solid #667eea',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.3rem',
                        color: '#667eea',
                        background: 'white'
                      }}>
                        {percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Time Card */}
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                marginBottom: '40px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <h1 style={{ 
                  fontSize: '4.5rem',
                  margin: '0',
                  color: '#667eea',
                  fontWeight: 'bold'
                }}>
                  {user.statistics?.totalMinutes || 0} min
                </h1>
                <p style={{ 
                  color: '#666',
                  margin: '10px 0 0 0',
                  fontSize: '1.3rem',
                  fontWeight: '500'
                }}>
                  Total time played
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                <button 
                  onClick={() => navigate('/')}
                  style={{
                    padding: '25px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                  }}
                >
                  Select new player
                </button>
                <button 
                  onClick={() => navigate(`/game/${userId}`)}
                  style={{
                    padding: '25px',
                    background: 'linear-gradient(135deg, #4caf50, #45a049)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                  }}
                >
                  Play new Game
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;