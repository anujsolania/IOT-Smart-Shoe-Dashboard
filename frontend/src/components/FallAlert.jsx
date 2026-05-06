import React, { useEffect, useRef } from 'react';
import { AlertTriangle, BellOff } from 'lucide-react';

const FallAlert = ({ isDetected, onDismiss }) => {
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-rose-950/80 backdrop-blur-md animate-flash-red">
      <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(244,63,94,0.5)]">
        <div className="bg-rose-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <AlertTriangle size={48} className="text-white" />
        </div>
        <h2 className="text-4xl font-black text-white mb-2">FALL DETECTED!</h2>
        <p className="text-rose-200 text-lg mb-8">An emergency fall has been detected on device shoe_001. Please check on the user immediately.</p>
        
        <button 
          onClick={onDismiss}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 mx-auto transition-all transform hover:scale-105 active:scale-95"
        >
          <BellOff size={20} />
          DISMISS ALERT
        </button>

        <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      </div>
    </div>
  );
};

export default FallAlert;
