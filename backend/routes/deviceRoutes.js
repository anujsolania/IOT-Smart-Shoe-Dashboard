const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.post('/data', deviceController.postSensorData);
router.get('/latest/:deviceId', deviceController.getLatestData);
router.get('/history/:deviceId', deviceController.getHistory);
router.get('/fall-events/:deviceId', deviceController.getFallEvents);

module.exports = router;
