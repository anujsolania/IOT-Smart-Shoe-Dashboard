const SensorData = require('../models/SensorData');

exports.postSensorData = async (req, res) => {
  try {
    const { deviceId, timestamp, distance, rain, acceleration, fallDetected, obstacleDetected, gps, status } = req.body;

    const newData = new SensorData({
      deviceId,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      distance,
      rain,
      acceleration,
      fallDetected,
      obstacleDetected,
      gps,
      status
    });

    await newData.save();

    // Emit socket event if io is attached to req
    if (req.io) {
      req.io.emit('sensor-update', newData);
    }

    res.status(201).json({ success: true, data: newData });
  } catch (error) {
    console.error('Error posting sensor data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getLatestData = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const latest = await SensorData.findOne({ deviceId }).sort({ timestamp: -1 });
    res.status(200).json({ success: true, data: latest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const history = await SensorData.find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(100);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getFallEvents = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const falls = await SensorData.find({ deviceId, fallDetected: true })
      .sort({ timestamp: -1 });
    res.status(200).json({ success: true, data: falls });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
