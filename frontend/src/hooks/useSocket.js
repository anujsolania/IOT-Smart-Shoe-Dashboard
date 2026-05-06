import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export const useSocket = (deviceId) => {
  const [socket, setSocket] = useState(null);
  const [latestData, setLatestData] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket');
    });

    newSocket.on('sensor-update', (data) => {
      if (data.deviceId === deviceId) {
        setLatestData(data);
      }
    });

    return () => newSocket.close();
  }, [deviceId]);

  return { socket, latestData };
};
