require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const historyRoutes = require('./routes/history');
const uploadRoutes = require('./routes/upload');
const qaRoutes = require('./routes/qa');

const app = express();
const PORT = process.env.PORT || 9000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/qa', qaRoutes);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});