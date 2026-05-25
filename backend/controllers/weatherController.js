const axios = require('axios');

exports.getWeather = async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ msg: 'Weather fetch failed' });
  }
};

exports.getForecast = async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ msg: 'Forecast fetch failed' });
  }
};