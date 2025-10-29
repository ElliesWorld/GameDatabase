import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from './services/api';

interface Weather {
  location: string;
  temperature: number;
  icon: string;
  condition: string;
}

function Play() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, gameId } = useParams<{ userId: string; gameId: string }>();
  
  // Get game info from navigation state
  const { gameName, gameIcon } = location.state || { gameName: 'Game', gameIcon: '🎮' };
  
  const [user, setUser] = useState<any>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch user info
  useEffect(() => {
    api.get(`/users/${userId}`)
      .then(response => {
        const userData = response.data.data || response.data;
        setUser(userData);
      })
      .catch(error => {
        console.error('Error fetching user:', error);
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

  // Timer logic
  useEffect(() => {
    if (isPlaying && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isPaused]);

  // Format time as HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = async () => {
    setIsPlaying(false);
    setIsPaused(false);

    if (seconds === 0) {
      alert('No time recorded!');
      navigate(`/profile/${userId}`);
      return;
    }

    try {
      // Save game session to database
      await api.post('/sessions', {
        userId: userId,
        gameId: gameId,
        duration: seconds  // seconds = minutes in display (1 sec = 1 min)
      });

      alert(`Game saved! You played for ${formatTime(seconds)}\n(${seconds} seconds = ${seconds} minutes for statistics)`);
      navigate(`/profile/${userId}`);
    } catch (error: any) {
      console.error('Error saving game session:', error);
      alert('Failed to save game session: ' + (error.response?.data?.message || error.message));
    }
  };

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
                  Wednesday, 15 Oct 2025
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

        {/* Right side - empty for balance */}
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
          onClick={() => navigate(`/profile/${userId}`)}
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
          <span>profile</span>
        </button>
        
        <button
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
          <span style={{ fontSize: '1.5rem' }}>🎮</span>
          <span>games</span>
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '60px 80px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          textAlign: 'center',
          minWidth: '500px'
        }}>
          
          {/* Game Icon */}
          <div style={{
            fontSize: '8rem',
            marginBottom: '20px'
          }}>
            {gameIcon}
          </div>

          {/* Game Name */}
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '50px',
            color: '#333'
          }}>
            {gameName}
          </h1>

          {/* Timer Display */}
          <div style={{
            background: '#f5f5f5',
            borderRadius: '20px',
            padding: '30px 40px',
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'inline-block',
              background: '#888',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}>
              TIME PLAYING:
            </div>
            <div style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              color: '#333'
            }}>
              {formatTime(seconds)}
            </div>
          </div>

          {/* Control Buttons */}
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            marginBottom: '40px'
          }}>
            {!isPlaying ? (
              <button
                onClick={handlePlay}
                style={{
                  padding: '20px 50px',
                  background: 'linear-gradient(135deg, #4caf50, #45a049)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(76,175,80,0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(76,175,80,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(76,175,80,0.4)';
                }}
              >
                ▶ PLAY
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    onClick={handleResume}
                    style={{
                      padding: '20px 50px',
                      background: 'linear-gradient(135deg, #4caf50, #45a049)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(76,175,80,0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(76,175,80,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(76,175,80,0.4)';
                    }}
                  >
                    ▶ RESUME
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    style={{
                      padding: '20px 50px',
                      background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(255,152,0,0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,152,0,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,152,0,0.4)';
                    }}
                  >
                    ⏸ PAUSE
                  </button>
                )}
                
                <button
                  onClick={handleStop}
                  style={{
                    padding: '20px 50px',
                    background: 'white',
                    color: '#333',
                    border: '3px solid #333',
                    borderRadius: '12px',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#333';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#333';
                  }}
                >
                  ⏹ STOP
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Card - Bottom Right */}
      {user && (
        <div
          onClick={() => navigate(`/profile/${userId}`)}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            minWidth: '120px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            overflow: 'hidden'
          }}>
            {user.profilePicture || '👤'}
          </div>
          <div style={{
            fontWeight: 'bold',
            fontSize: '1rem',
            color: '#333'
          }}>
            {user.nickname}
          </div>
        </div>
      )}
    </div>
  );
}

export default Play;