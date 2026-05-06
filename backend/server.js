require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const deviceRoutes = require('./routes/deviceRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach io to req so controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/device', deviceRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Smart Shoe Monitor API is running...');
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB Connection
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // LISTEN ON 0.0.0.0 TO ALLOW EXTERNAL CONNECTIONS
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT} (All Interfaces)`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
