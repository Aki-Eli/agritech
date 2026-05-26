/**
 * Weather controller.
 * Proxies requests to the OpenWeatherMap API so the API key stays server-side.
 */
const axios = require('axios');

/**
 * GET /api/weather?lat=&lon=
 * Returns current weather conditions for the given coordinates.
 */
exports.getWeather = async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ msg: 'lat and lon query parameters are required' });
  }
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric'
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('getWeather error:', err.message);
    res.status(500).json({ msg: 'Weather fetch failed' });
  }
};

/**
 * GET /api/weather/forecast?lat=&lon=
 * Returns a 5-day / 3-hour forecast for the given coordinates.
 */
exports.getForecast = async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ msg: 'lat and lon query parameters are required' });
  }
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric'
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('getForecast error:', err.message);
    res.status(500).json({ msg: 'Forecast fetch failed' });
  }
};
