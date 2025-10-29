import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, LineChart, Line, Cell } from 'recharts';
import api from './services/api';

interface GameSession {
  id: string;
  userId: string;
  gameId: string;
  duration: number;
  createdAt: string;
  user: {
    nickname: string;
    firstName: string;
    lastName: string;
  };
  game: {
    name: string;
  };
}

interface Weather {
  location: string;
  temperature: number;
  icon: string;
  condition: string;
}

function Statistics() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>('all');

  useEffect(() => {
    // Fetch all game sessions
    api.get('/sessions')
      .then(response => {
        console.log('Sessions response:', response.data);
        const sessionsData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setSessions(sessionsData);
        
        // Set first game as default selection
        if (sessionsData.length > 0) {
          const firstGame = sessionsData[0].game.name;
          setSelectedGame(firstGame);
        }
        
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching sessions:', error);
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

  // Process data for charts
  const getScatterData = () => {
    if (selectedGame === 'all') {
      return [];
    }

    const filteredSessions = sessions.filter(s => s.game.name === selectedGame);

    // Group by user to calculate frequency and total duration
    const userStats: { [key: string]: { count: number; totalDuration: number; name: string } } = {};
    
    filteredSessions.forEach(session => {
      const userId = session.userId;
      if (!userStats[userId]) {
        userStats[userId] = {
          count: 0,
          totalDuration: 0,
          name: session.user.nickname
        };
      }
      userStats[userId].count += 1;
      userStats[userId].totalDuration += session.duration;
    });

    // Define colors for different users
    const colors = ['#667eea', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#f8b500', '#e74c3c'];

    return Object.entries(userStats).map(([userId, stats], index) => ({
      x: stats.count,
      y: stats.totalDuration,
      name: stats.name,
      fill: colors[index % colors.length]
    }));
  };

  const getLineData = () => {
    // Group sessions by date and user
    const dailyData: { [key: string]: { [key: string]: number } } = {};
    
    sessions.forEach(session => {
      const date = new Date(session.createdAt).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = {};
      }
      const user = session.user.nickname;
      dailyData[date][user] = (dailyData[date][user] || 0) + session.duration;
    });

    return Object.entries(dailyData).map(([date, users]) => ({
      date,
      ...users
    }));
  };

  const getBarData = () => {
    const gameMinutes: { [key: string]: number } = {};
    
    sessions.forEach(session => {
      const game = session.game.name;
      gameMinutes[game] = (gameMinutes[game] || 0) + session.duration;
    });

    const colors = ['#667eea', '#764ba2', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];

    return Object.entries(gameMinutes).map(([game, minutes], index) => ({
      game,
      minutes,
      fill: colors[index % colors.length]
    }));
  };

  const getLeaderboard = () => {
    const userStats: { [key: string]: { name: string; game: string; minutes: number } } = {};
    
    sessions.forEach(session => {
      const userId = session.userId;
      if (!userStats[userId]) {
        userStats[userId] = {
          name: session.user.nickname,
          game: session.game.name,
          minutes: 0
        };
      }
      userStats[userId].minutes += session.duration;
    });

    return Object.values(userStats)
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 10);
  };

  const games = Array.from(new Set(sessions.map(s => s.game.name)));

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{ color: 'white' }}>⏳ Loading statistics...</h1>
      </div>
    );
  }

  const scatterData = getScatterData();
  const lineData = getLineData();
  const barData = getBarData();
  const leaderboard = getLeaderboard();

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
          <span style={{ fontSize: '1.5rem' }}>📊</span>
          <span>stats</span>
        </button>

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
          <span style={{ fontSize: '1.5rem' }}>🎮</span>
          <span>games</span>
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
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Title */}
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            Game Statistics
          </h1>

          {/* Charts Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '30px',
            marginBottom: '30px'
          }}>
            
            {/* Chart 1: Scatter Plot - Play Frequency */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Session Frequency</h3>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  {games.map(game => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ left: 25, right: 10, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Times Played"
                    domain={[0, 'dataMax + 1']}
                    allowDecimals={false}
                    label={{ value: 'Times Played', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Total Duration"
                    label={{ value: 'Total Time (minutes)', angle: -90, position: 'insideLeft', offset: 0, style: { textAnchor: 'middle' } }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ payload }) => {
                      if (payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div style={{
                            background: 'white',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '8px'
                          }}>
                            <p style={{ margin: 0 }}><strong>{data.name}</strong></p>
                            <p style={{ margin: 0 }}>Times Played: {data.x}</p>
                            <p style={{ margin: 0 }}>Total Duration: {data.y} min</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter data={scatterData}>
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Line Chart - Minutes per User/Day */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
                Minutes Played per User/Day
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {lineData.length > 0 && Object.keys(lineData[0])
                    .filter(key => key !== 'date')
                    .map((user, index) => (
                      <Line 
                        key={user}
                        type="monotone" 
                        dataKey={user} 
                        stroke={['#667eea', '#764ba2', '#ff6b6b', '#4ecdc4'][index % 4]}
                        strokeWidth={2}
                      />
                    ))
                  }
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 3: Bar Chart - Minutes per Game */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
                Total Minutes per Game
              </h3>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={barData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="game" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="minutes">
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 4: Leaderboard */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
                Leaderboard
              </h3>
              
              {leaderboard.length === 0 ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#999'
                }}>
                  <p>No game sessions yet!</p>
                  <p style={{ fontSize: '0.9rem' }}>Play some games to see the leaderboard</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{
                        borderBottom: '2px solid #e0e0e0',
                        background: '#f8f9fa'
                      }}>
                        <th style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontWeight: 'bold'
                        }}>Rank</th>
                        <th style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontWeight: 'bold'
                        }}>Name</th>
                        <th style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontWeight: 'bold'
                        }}>Favorite Game</th>
                        <th style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontWeight: 'bold'
                        }}>Time Played</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((player, index) => {
                        const hours = Math.floor(player.minutes / 60);
                        const mins = player.minutes % 60;
                        return (
                          <tr 
                            key={index}
                            style={{
                              borderBottom: '1px solid #f0f0f0',
                              background: index % 2 === 0 ? 'white' : '#fafafa'
                            }}
                          >
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                display: 'inline-block',
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e0e0e0',
                                textAlign: 'center',
                                lineHeight: '30px',
                                fontWeight: 'bold'
                              }}>
                                {index + 1}
                              </span>
                            </td>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>
                              {player.name}
                            </td>
                            <td style={{ padding: '12px' }}>
                              {player.game}
                            </td>
                            <td style={{ padding: '12px', color: '#667eea', fontWeight: 'bold' }}>
                              {hours > 0 ? `${hours}h ${mins}min` : `${mins} min`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;