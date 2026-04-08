import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db.js';
import User from './models/User.js';

// 1. Load environment variables
dotenv.config();

// 2. Connect to the Database
connectDB();

const app = express();
app.use(express.json());

// Routes
app.post('/api/users', async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = new User({ username, email });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));