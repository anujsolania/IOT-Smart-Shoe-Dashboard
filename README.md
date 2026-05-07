# 👟 IoT Smart Shoe Dashboard

An advanced, full-stack IoT solution designed for the safety and navigation of elderly and visually impaired individuals. This system combines hardware-level sensing with a modern web-based monitoring platform to provide real-time fall detection, obstacle avoidance, and GPS tracking.

![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-MERN--IoT-blue?style=for-the-badge)

---

## ✨ Key Features

- **🚨 Intelligent Fall Detection**: Uses an MPU6050 accelerometer with a multi-stage confirmation algorithm to ensure high accuracy and reduce false alerts.
- **🛰️ Live GPS Monitoring**: Integrated GPS module provides precise latitude and longitude, visualized on a real-time Leaflet map.
- **📳 Haptic Feedback System**: A vibration motor provides immediate physical alerts to the wearer upon obstacle detection or emergency events.
- **📊 Real-time Telemetry**: High-speed data streaming using **Socket.IO** ensures the dashboard reflects sensor data (acceleration, distance, status) with sub-second latency.
- **🛡️ Obstacle Awareness**: Ultrasonic sensors detect objects within a 15cm range, triggering safety protocols.
- **🔗 Emergency Redirection**: One-click Google Maps links automatically generated for rapid emergency response.

---

## 🛠️ Technology Stack

### **Frontend (Dashboard)**
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS
- **Maps**: Leaflet / React-Leaflet
- **Charts**: Recharts (for live sensor analytics)
- **Icons**: Lucide React
- **Networking**: Socket.io-client, Axios

### **Backend (API & Socket Server)**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Tunneling**: Cloudflare Tunnel (for secure device-to-cloud communication)

### **Firmware (Hardware)**
- **Controller**: ESP32
- **Language**: Arduino C++
- **Libraries**: TinyGPS++, Adafruit MPU6050, ArduinoJson, HTTPClient

---

## 📐 System Architecture

1. **Sensing Layer**: The ESP32 collects data from the MPU6050 (Motion), HC-SR04 (Distance), and GPS modules.
2. **Transmission Layer**: Processed data is sent as JSON payloads to the Node.js backend via encrypted tunnels.
3. **Processing Layer**: The backend validates data, persists it to MongoDB, and broadcasts updates via WebSockets.
4. **Visualization Layer**: The React dashboard renders the live data, charts, and map location dynamically.

---

## 📂 Project Structure

```text
.
├── backend/            # Node.js Express server & Socket.IO
│   ├── routes/         # API endpoints
│   ├── models/         # MongoDB schemas
│   └── mock-sensor.js  # Hardware simulator
├── frontend/           # React/Vite Dashboard
│   ├── src/components/ # UI Components (Maps, Charts, Alerts)
│   └── src/assets/     # Styles and images
└── firmware/           # ESP32 Arduino source code
```

---

## 🚀 Getting Started

### **1. Backend Setup**
```bash
cd backend
npm install
```
- Create a `.env` file:
  ```env
  PORT=5001
  MONGO_URI=your_mongodb_uri
  CLIENT_URL=http://localhost:5173
  ```
- Start the server: `npm run dev`

### **2. Testing with Mock Data (Optional)**
If you don't have the hardware ready, you can simulate a smart shoe device:
```bash
cd backend
node mock-sensor.js
```
This script sends random sensor data, GPS coordinates, and occasional fall alerts to the dashboard.

### **3. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

### **4. Firmware Deployment**
- Open `firmware/smart-shoe-esp32.ino` in the Arduino IDE.
- Update WiFi credentials:
  ```cpp
  const char* ssid = "YOUR_WIFI_SSID";
  const char* password = "YOUR_WIFI_PASSWORD";
  const char* serverUrl = "YOUR_BACKEND_URL/api/device/data";
  ```
- Install required libraries (MPU6050, TinyGPS++, ArduinoJson).
- Upload to your ESP32.

---

## 📦 Hardware Requirements

- **Microcontroller**: ESP32 (DevKit V1)
- **IMU**: MPU6050 (Accelerometer + Gyro)
- **Distance**: HC-SR04 Ultrasonic Sensor
- **Positioning**: NEO-6M GPS Module
- **Alerts**: 3V Vibration Motor
- **Power**: 3.7V Li-ion Battery with TP4056 Charger

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

*Developed with ❤️ for accessibility and safety.*
