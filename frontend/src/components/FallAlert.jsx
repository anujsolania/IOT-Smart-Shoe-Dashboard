import React, { useEffect, useRef } from 'react';
import { AlertTriangle, BellOff, Navigation } from 'lucide-react';

const FallAlert = ({ isDetected, onDismiss, gps }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (isDetected) {
      const playAlert = () => {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log("Audio play blocked", e));
        }
      };
      const interval = setInterval(playAlert, 2000);
      playAlert();
      return () => clearInterval(interval);
    }
  }, [isDetected]);

  if (!isDetected) return null;

  // UPDATED OFFICIAL API URL WITH 6 DECIMAL PLACES PRECISION
  const googleMapsUrl = gps 
    ? `https://www.google.com/maps?q=${gps.lat.toFixed(6)},${gps.lng.toFixed(6)}` 
    : '#';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-rose-950/80 backdrop-blur-md animate-flash-red">
      <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(244,63,94,0.5)]">
        <div className="bg-rose-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <AlertTriangle size={48} className="text-white" />
        </div>
        <h2 className="text-4xl font-black text-white mb-2">FALL DETECTED!</h2>
        <p className="text-rose-200 text-lg mb-6">An emergency fall has been detected. Please check on the user immediately.</p>
        
        <div className="flex flex-col gap-3">
          {gps && (
            <a 
              href={googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            >
              <Navigation size={20} />
              VIEW ON GOOGLE MAPS
            </a>
          )}

          <button 
            onClick={onDismiss}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <BellOff size={20} />
            DISMISS ALERT
          </button>
        </div>

        <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      </div>
    </div>
  );
};

export default FallAlert;
