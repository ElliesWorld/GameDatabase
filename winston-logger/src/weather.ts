import { Router } from 'express';

const router = Router();

async function getWeatherByCity(cityName: string) {
  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`;
  const geocodeRes = await fetch(geocodeUrl);
  const geocodeData = await geocodeRes.json();
  
  if (!geocodeData.results?.[0]) {
    throw new Error('City not found');
  }
  
  const location = geocodeData.results[0];
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true`;
  const weatherRes = await fetch(weatherUrl);
  const weatherData = await weatherRes.json();
  
  const weatherCode = weatherData.current_weather.weathercode;
  let condition = 'Clear Sky';
  let icon = '☀️';
  let game = 'Snowball Showdown';
  
  // Determine weather condition and game recommendation
  if (weatherCode >= 2 && weatherCode <= 3) {
    condition = 'Cloudy';
    icon = '☁️';
    game = 'Bear Panic';
  } else if (weatherCode >= 51 && weatherCode <= 67) {
    condition = 'Rain';
    icon = '🌧️';
    game = 'Meteor Mayhem';
  } else if (weatherCode >= 71 && weatherCode <= 77) {
    condition = 'Snow';
    icon = '❄️';
    game = 'Tarzan Rumble';
  } else if (weatherCode >= 95 && weatherCode <= 99) {
    condition = 'Thunderstorm';
    icon = '⛈️';
    game = 'Bear Panic';
  }
  
  return {
    location: `${location.name}, ${location.country}`,
    temperature: Math.round(weatherData.current_weather.temperature),
    icon,
    condition,
    recommendedGame: game,
    suggestion: `Perfect weather for ${game}!`
  };
}

// GET /api/weather/:city - Get weather for specific city
router.get('/:city', async (req, res) => {
  try {
    const weather = await getWeatherByCity(req.params.city);
    res.json({ success: true, data: weather });
  } catch (error) {
    console.error('Weather error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch weather' 
    });
  }
});

// GET /api/weather - Get default weather (Oslo)
router.get('/', async (req, res) => {
  try {
    const weather = await getWeatherByCity('Oslo');
    res.json({ success: true, data: weather });
  } catch (error) {
    console.error('Weather error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch weather' 
    });
  }
});

export default router;