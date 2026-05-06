import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CloudRain, 
  Navigation, 
  MapPin, 
  History, 
  AlertCircle,
  TrendingUp,
  Cpu,
  Clock,
  Layers
} from 'lucide-react';
import SensorCard from './SensorCard';
import LiveCharts from './LiveCharts';
import Map from './Map';
import FallAlert from './FallAlert';
import { useSocket } from '../hooks/useSocket';
import { deviceService } from '../services/api';

const Dashboard = () => {
  const [deviceId, setDeviceId] = useState('shoe_001');
  const { latestData, socket } = useSocket(deviceId);
  const [history, setHistory] = useState([]);
  const [showFallAlert, setShowFallAlert] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [deviceId]);

  useEffect(() => {
    if (latestData) {
      setHistory(prev => [latestData, ...prev.slice(0, 49)]);
      if (latestData.fallDetected) {
        setShowFallAlert(true);
      }
    }
  }, [latestData]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await deviceService.getHistory(deviceId);
      setHistory(res.data.data);
      if (res.data.data.length > 0 && res.data.data[0].fallDetected) {
        setShowFallAlert(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const current = latestData || history[0] || {};

  return (
    <div className="min-h-screen bg-slate-950 p-4 lg:p-8">
      <FallAlert isDetected={showFallAlert} onDismiss={() => setShowFallAlert(false)} />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-blue-500 font-bold mb-1 uppercase tracking-widest text-xs">
            <Cpu size={14} />
            IoT Smart Shoe System
          </div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Device Monitor
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-md font-mono">
              v1.0.4
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 appearance-none min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="shoe_001">Device: shoe_001</option>
              <option value="shoe_002">Device: shoe_002</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <Layers size={16} />
            </div>
          </div>
          <button 
            onClick={fetchHistory}
            className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <Clock size={20} />
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stats and Charts */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <SensorCard 
              title="Status" 
              value={current.status?.toUpperCase() || 'OFFLINE'} 
              icon={Activity} 
              color={current.status === 'walking' ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-400"}
              loading={loading}
            />
            <SensorCard 
              title="Obstacle Distance" 
              value={current.distance || 0} 
              unit="cm" 
              icon={AlertCircle}
              color={(current.distance < 20) ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500"}
              loading={loading}
            />
            <SensorCard 
              title="Rain Intensity" 
              value={current.rain || 0} 
              unit="lvl" 
              icon={CloudRain}
              color={(current.rain > 500) ? "bg-cyan-500/10 text-cyan-500" : "bg-slate-500/10 text-slate-400"}
              loading={loading}
            />
            <SensorCard 
              title="Fall Status" 
              value={current.fallDetected ? 'DETECTED' : 'SAFE'} 
              icon={TrendingUp}
              color={current.fallDetected ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}
              loading={loading}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <Navigation size={18} className="text-blue-500" />
                Distance History
              </h3>
              <LiveCharts data={history} type="distance" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" />
                IMU Acceleration
              </h3>
              <LiveCharts data={history} type="acceleration" />
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2">
                <History size={18} className="text-slate-400" />
                Recent Activity Log
              </h3>
              <span className="text-xs text-slate-500">Showing last 50 readings</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/30 text-slate-400 text-xs uppercase tracking-widest">
                    <th className="px-6 py-4 font-medium">Time</th>
                    <th className="px-6 py-4 font-medium">Distance</th>
                    <th className="px-6 py-4 font-medium">Rain</th>
                    <th className="px-6 py-4 font-medium">Fall</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {history.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-slate-300 font-mono text-sm">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 text-white font-bold">{item.distance} cm</td>
                      <td className="px-6 py-4 text-slate-400">{item.rain}</td>
                      <td className="px-6 py-4">
                        <span className={item.fallDetected ? "text-rose-500 font-bold" : "text-emerald-500"}>
                          {item.fallDetected ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Map and Device Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <MapPin size={18} className="text-rose-500" />
              Live GPS Tracking
            </h3>
            <div className="h-[400px] mb-6">
              <Map lat={current.gps?.lat} lng={current.gps?.lng} />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 text-sm">Latitude</span>
                <span className="text-white font-mono">{current.gps?.lat?.toFixed(6) || '---'}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 text-sm">Longitude</span>
                <span className="text-white font-mono">{current.gps?.lng?.toFixed(6) || '---'}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
            <h4 className="font-bold text-xl mb-2">Guardian Control</h4>
            <p className="text-blue-100 text-sm mb-6">You are currently monitoring shoe_001. All telemetry is being received in real-time via Socket.IO.</p>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
