import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './services/api';

interface Game {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

interface Weather {
  location: string;
  temperature: number;
  icon: string;
  condition: string;
  recommendedGame: string;
  suggestion: string;
}

function GameSelection() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [games, setGames] = useState<Game[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Fetch user info
    api.get(`/users/${userId}`)
      .then(response => {
        const userData = response.data.data || response.data;
        setUser(userData);
      })
      .catch(error => {
        console.error('Error fetching user:', error);
      });

    // Fetch games
    api.get('/games')
      .then(response => {
        console.log('Games response:', response.data);
        const gamesData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setGames(gamesData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching games:', error);
        setError('Failed to load games');
        setLoading(false);
      });

    // Fetch weather
    api.get('/weather')
      .then(response => {
        console.log('Weather response:', response.data);
        const weatherData = response.data.data || response.data;
        setWeather(weatherData);
      })
      .catch(error => {
        console.error('Error fetching weather:', error);
      });
  }, [userId]);

const handleGameSelect = (gameId: string, gameName: string) => {
  // Get game icon
  let gameIcon = '🎮';
  if (gameName.includes('Snowball')) gameIcon = '⛄';
  if (gameName.includes('Bear')) gameIcon = '🐻';
  if (gameName.includes('Meteor')) gameIcon = '☄️';
  if (gameName.includes('Tarzan')) gameIcon = '🦍';
  
  // Navigate to play page with game info
  navigate(`/play/${userId}/${gameId}`, {
    state: { gameName, gameIcon }
  });
};

  if (loading) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{ color: 'white' }}>⏳ Loading games...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '40px'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ color: 'white', marginBottom: '20px' }}>❌ {error}</h1>
          <button
            onClick={() => navigate(`/profile/${userId}`)}
            style={{
              padding: '15px 30px',
              background: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header with Back Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '30px',
          gap: '20px'
        }}>
          <button
            onClick={() => navigate(`/profile/${userId}`)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid white',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '50px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = 'white';
            }}
          >
            ◀ Back to Profile
          </button>

          {user && (
            <div style={{
              color: 'white',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '2rem' }}>{user.profilePicture || '👤'}</span>
              <span>{user.nickname}</span>
            </div>
          )}
        </div>

        {/* Weather Widget */}
        {weather && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '25px',
            marginBottom: '30px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '4rem' }}>{weather.icon}</span>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
                  {weather.location}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#667eea' }}>
                  {weather.temperature}°C
                </div>
                <div style={{ fontSize: '1.1rem', color: '#666' }}>
                  {weather.condition}
                </div>
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '20px 30px',
              borderRadius: '12px',
              textAlign: 'center',
              maxWidth: '300px'
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '5px', opacity: 0.9 }}>
                🎮 Recommended Game
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '5px' }}>
                {weather.recommendedGame}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                {weather.suggestion}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '15px',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            🎮 Select a Game
          </h1>
          
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#666', 
            marginBottom: '40px' 
          }}>
            Choose a game to start playing and track your progress
          </p>

          {/* Games Grid */}
          {games.length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              background: '#f5f5f5',
              borderRadius: '12px'
            }}>
              <h3 style={{ color: '#999' }}>No games available</h3>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '25px'
            }}>
              {games.map((game) => {
                const isRecommended = weather?.recommendedGame === game.name;
                
                return (
                  <div
                    key={game.id}
                    onClick={() => handleGameSelect(game.id, game.name)}
                    style={{
                      position: 'relative',
                      background: isRecommended 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'white',
                      border: isRecommended ? 'none' : '3px solid #e0e0e0',
                      borderRadius: '16px',
                      padding: '25px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: isRecommended 
                        ? '0 8px 24px rgba(102,126,234,0.4)'
                        : '0 4px 12px rgba(0,0,0,0.1)',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = isRecommended
                        ? '0 12px 32px rgba(102,126,234,0.5)'
                        : '0 8px 24px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isRecommended
                        ? '0 8px 24px rgba(102,126,234,0.4)'
                        : '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                  >
                    {/* Recommended Badge */}
                    {isRecommended && (
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'rgba(255,255,255,0.9)',
                        color: '#667eea',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        ⭐ Recommended
                      </div>
                    )}

                    {/* Game Icon Placeholder */}
                    <div style={{
                      width: '100%',
                      height: '180px',
                      background: isRecommended 
                        ? 'rgba(255,255,255,0.2)' 
                        : 'linear-gradient(135deg, #f5f5f5, #e0e0e0)',
                      borderRadius: '12px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '4rem'
                    }}>
                      {game.name.includes('Snowball') && '⛄'}
                      {game.name.includes('Bear') && '🐻'}
                      {game.name.includes('Meteor') && '☄️'}
                      {game.name.includes('Tarzan') && '🦍'}
                    </div>

                    {/* Game Name */}
                    <h3 style={{
                      fontSize: '1.5rem',
                      marginBottom: '10px',
                      color: isRecommended ? 'white' : '#333',
                      fontWeight: 'bold'
                    }}>
                      {game.name}
                    </h3>

                    {/* Play Button */}
                    <button
                      style={{
                        width: '100%',
                        padding: '15px',
                        background: isRecommended 
                          ? 'white' 
                          : 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: isRecommended ? '#667eea' : 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginTop: '10px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      ▶ Play Now
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameSelection;