const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

require('dotenv').config();
dotenv.config();

const app = express();
connectDB();

const allowedOrigins = [
  'http://localhost:5173',
  'https://your-frontend-domain.com',
  "https://algotrack-vujc.onrender.com/api/auth/login",
  "https://algo-track-tau.vercel.app/login",
  'https://algo-track-tau.vercel.app',
  "*",
  "**"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/questions', require('./routes/questionsRoutes'));

app.get('/', (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
