import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

app.use(cors());

app.get('/api/places', async (req, res) => {
  const { location, type } = req.query;

  if (!location || !type) {
    return res.status(400).json({ error: 'Missing location or type' });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=3000&type=${type}&key=${API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching from Google Places API:', err);
    res.status(500).json({ error: 'Failed to fetch from Google Places API' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
