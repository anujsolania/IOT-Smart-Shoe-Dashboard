const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  distance: Number,
  rain: Number,
  acceleration: {
    x: Number,
    y: Number,
    z: Number
  },
  fallDetected: {
    type: Boolean,
    default: false
  },
  obstacleDetected: {
    type: Boolean,
    default: false
  },
  gps: {
    lat: Number,
    lng: Number
  },
  mapLink: String,
  status: {
    type: String,
    enum: ['standing', 'walking', 'fallen', 'unknown', 'GREEN', 'RED'],
    default: 'GREEN'
  }
}, { timestamps: true });

module.exports = mongoose.model('SensorData', sensorDataSchema);
