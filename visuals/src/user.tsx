import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';

interface Weather {
  location: string;
  temperature: number;
  icon: string;
  condition: string;
  date: string;
}

function User() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState<Weather | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    nickname: '',
    profilePicture: ''
  });
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Available avatar options (emojis)
  const avatars = [
    '👤', '🦊', '🐻', '🦁', '🐯',
    '🦄', '🐼', '🐨', '🦝', '🐶'
  ];

  useEffect(() => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setFormData(prev => ({
      ...prev,
      profilePicture: avatar
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.nickname) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (!formData.profilePicture) {
      setError('Please select an avatar');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/users', formData);
      console.log('User created:', response.data);
      
      navigate('/');
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(error.response?.data?.message || 'Failed to create user. Email or nickname may already exist.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Weather Widget */}
        {weather && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '15px 25px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxWidth: '300px'
          }}>
            <span style={{ fontSize: '2.5rem', marginRight: '15px' }}>{weather.icon}</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{weather.date}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{weather.temperature}°C</div>
            </div>
          </div>
        )}

        {/* Main Registration Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '50px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '40px',
            paddingBottom: '20px',
            borderBottom: '2px solid #e0e0e0'
          }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '2rem',
                cursor: 'pointer',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              ◀ <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>Create New User</span>
            </button>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            
            {/* Error Message */}
            {error && (
              <div style={{
                background: '#ffebee',
                border: '2px solid #f44336',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px',
                color: '#c62828'
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Email Field */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '1.1rem',
                color: '#333'
              }}>
                Email address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="xyz@abc.com"
                required
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* First Name Field */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '1.1rem',
                color: '#333'
              }}>
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Last Name Field */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '1.1rem',
                color: '#333'
              }}>
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Nickname Field */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '1.1rem',
                color: '#333'
              }}>
                Nickname *
              </label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Avatar Selection */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '15px',
                fontSize: '1.1rem',
                color: '#333'
              }}>
                Profile Picture *
              </label>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '15px',
                marginBottom: '20px'
              }}>
                {avatars.map((avatar) => (
                  <div
                    key={avatar}
                    onClick={() => handleAvatarSelect(avatar)}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      background: selectedAvatar === avatar ? '#667eea' : '#f5f5f5',
                      border: selectedAvatar === avatar ? '4px solid #764ba2' : '2px solid #e0e0e0',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: selectedAvatar === avatar ? '0 4px 12px rgba(102,126,234,0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedAvatar !== avatar) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.borderColor = '#667eea';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedAvatar !== avatar) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = '#e0e0e0';
                      }
                    }}
                  >
                    {avatar}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginTop: '40px'
            }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  padding: '18px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#5a6268'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#6c757d'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '18px',
                  background: loading ? '#ccc' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = '#45a049';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.background = '#4caf50';
                }}
              >
                {loading ? 'Creating...' : 'REGISTER'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default User;