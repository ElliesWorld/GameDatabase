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
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadTab, setUploadTab] = useState<'emoji' | 'upload'>('emoji');

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
    setUploadedImage('');
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      profilePicture: avatar
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(''); // Clear any previous errors

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    const formDataUpload = new FormData();
    formDataUpload.append('profilePicture', file);

    try {
      const response = await api.post('/upload/profile-picture', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const imageUrl = response.data.data.url;
      setUploadedImage(imageUrl);
      setSelectedAvatar('');
      
      // Update formData immediately with the uploaded image URL
      setFormData(prev => ({
        ...prev,
        profilePicture: imageUrl
      }));
      
      setError('');
    } catch (error: any) {
      console.error('Upload error:', error);
      setError('Failed to upload image. Please try again.');
      setImagePreview(''); // Clear preview on error
    }
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

    // Check if either emoji avatar is selected OR image is uploaded
    if (!formData.profilePicture && !uploadedImage) {
      setError('Please select an avatar or upload a profile picture');
      setLoading(false);
      return;
    }

    // If image was uploaded, make sure it's in formData
    if (uploadedImage && !formData.profilePicture) {
      setFormData(prev => ({
        ...prev,
        profilePicture: uploadedImage
      }));
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Ensure profilePicture is set before submitting
      const submitData = {
        ...formData,
        profilePicture: formData.profilePicture || uploadedImage
      };
      
      const response = await api.post('/users', submitData);
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

            {/* Profile Picture Selection */}
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

              {/* Tab buttons */}
              <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <button
                  type="button"
                  onClick={() => setUploadTab('emoji')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: uploadTab === 'emoji' ? '#667eea' : '#f5f5f5',
                    color: uploadTab === 'emoji' ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  😀 Choose Emoji
                </button>
                <button
                  type="button"
                  onClick={() => setUploadTab('upload')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: uploadTab === 'upload' ? '#667eea' : '#f5f5f5',
                    color: uploadTab === 'upload' ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  📤 Upload Image
                </button>
              </div>

              {/* Emoji avatars */}
              {uploadTab === 'emoji' && (
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
              )}

              {/* Upload section */}
              {uploadTab === 'upload' && (
                <div>
                  <div style={{
                    border: '2px dashed #e0e0e0',
                    borderRadius: '12px',
                    padding: '40px',
                    textAlign: 'center',
                    background: '#f9f9f9',
                    marginBottom: '20px'
                  }}>
                    {imagePreview ? (
                      <div style={{ marginBottom: '20px' }}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            width: '150px',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: '4px solid #667eea'
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📷</div>
                    )}
                    
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="file-upload"
                      style={{
                        display: 'inline-block',
                        padding: '12px 30px',
                        background: '#667eea',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#5568d3'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
                    >
                      {imagePreview ? 'Change Image' : 'Choose File'}
                    </label>
                    <p style={{ marginTop: '15px', color: '#666', fontSize: '0.9rem' }}>
                      Supported: JPEG, PNG, GIF, WebP (Max 5MB)
                    </p>
                  </div>
                </div>
              )}
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