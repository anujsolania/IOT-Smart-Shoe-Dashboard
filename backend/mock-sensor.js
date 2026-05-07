const axios = require('axios');

const API_URL = 'http://localhost:5001/api/device/data';
const DEVICE_ID = 'shoe_001';

let lat = 28.704060;
let lng = 77.102493;

console.log('Starting Mock Sensor Data Stream...');
console.log('Sending data to:', API_URL);

const sendData = async () => {
  // Simulate slight movement
  lat += (Math.random() - 0.5) * 0.0001;
  lng += (Math.random() - 0.5) * 0.0001;

  const data = {
    deviceId: DEVICE_ID,
    timestamp: new Date().toISOString(),
    distance: Math.floor(Math.random() * 200),
    rain: Math.floor(Math.random() * 1024),
    acceleration: {
      x: (Math.random() * 10 - 5).toFixed(2),
      y: (Math.random() * 10 - 5).toFixed(2),
      z: (Math.random() * 10 + 5).toFixed(2)
    },
    fallDetected: Math.random() > 0.98, // 2% chance of fall
    obstacleDetected: Math.random() > 0.5,
    gps: {
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6))
    },
    mapLink: `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`,
    status: Math.random() > 0.5 ? 'walking' : 'standing'
  };

  try {
    await axios.post(API_URL, data);
    console.log(`[${new Date().toLocaleTimeString()}] Data sent: dist=${data.distance}cm, rain=${data.rain}, fall=${data.fallDetected}`);
  } catch (error) {
    console.error('Error sending data:', error.message);
  }
};

// Send data every 2 seconds
setInterval(sendData, 2000);

// Initial send
sendData();
