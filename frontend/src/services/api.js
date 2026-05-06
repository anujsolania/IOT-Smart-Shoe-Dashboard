import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

export const deviceService = {
  getLatest: (deviceId) => api.get(`/device/latest/${deviceId}`),
  getHistory: (deviceId) => api.get(`/device/history/${deviceId}`),
  getFalls: (deviceId) => api.get(`/device/fall-events/${deviceId}`),
};

export default api;
