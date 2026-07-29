import { useState, useEffect, useRef } from 'react';

const AnimatedCounter = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(0);
      prevValueRef.current = 0;
      return;
    }

    const start = prevValueRef.current;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 500; // ms
    const startTime = performance.now();

    let animationFrameId;

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.round(start + (end - start) * easeProgress);

      setDisplayValue(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        prevValueRef.current = end;
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value]);

  return <span className="animate-fade-in font-bold text-emerald-400">{displayValue}</span>;
};

const LoadingPlaceholder = () => (
  <span className="inline-flex space-x-1 items-center">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]"></span>
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]"></span>
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
  </span>
);

const LiveCounter = ({ selectedCategory, loading, facilities = [], onZoomToLocation }) => {

  return (
    <div className="absolute top-4 right-4 z-[9999] w-72 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-2xl flex flex-col gap-2.5 auth-card-floating text-left">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Counters</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      </div>
      <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-2.5 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Hospitals */}
          <div className={`flex items-center justify-between p-1.5 rounded transition-all duration-300 ${selectedCategory === 'Hospitals' ? 'bg-slate-850 border border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.05)]' : 'opacity-60'}`}>
            <div className="flex items-center space-x-1.5">
              <span>🏥</span>
              <span className="text-slate-300">Hospitals</span>
            </div>
            <span className="font-semibold text-slate-100 min-w-[20px] text-right flex items-center justify-end">
              {selectedCategory === 'Hospitals' ? (loading ? <LoadingPlaceholder /> : <AnimatedCounter value={facilities.length} />) : <span className="text-slate-600">-</span>}
            </span>
          </div>
          
          {/* Police */}
          <div className={`flex items-center justify-between p-1.5 rounded transition-all duration-300 ${selectedCategory === 'Police Stations' ? 'bg-slate-850 border border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.05)]' : 'opacity-60'}`}>
            <div className="flex items-center space-x-1.5">
              <span>👮</span>
              <span className="text-slate-300">Police</span>
            </div>
            <span className="font-semibold text-slate-100 min-w-[20px] text-right flex items-center justify-end">
              {selectedCategory === 'Police Stations' ? (loading ? <LoadingPlaceholder /> : <AnimatedCounter value={facilities.length} />) : <span className="text-slate-600">-</span>}
            </span>
          </div>

          {/* Fire Stations */}
          <div className={`flex items-center justify-between p-1.5 rounded transition-all duration-300 ${selectedCategory === 'Fire Stations' ? 'bg-slate-850 border border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.05)]' : 'opacity-60'}`}>
            <div className="flex items-center space-x-1.5">
              <span>🚒</span>
              <span className="text-slate-300">Fire</span>
            </div>
            <span className="font-semibold text-slate-100 min-w-[20px] text-right flex items-center justify-end">
              {selectedCategory === 'Fire Stations' ? (loading ? <LoadingPlaceholder /> : <AnimatedCounter value={facilities.length} />) : <span className="text-slate-600">-</span>}
            </span>
          </div>

          {/* Pharmacies */}
          <div className={`flex items-center justify-between p-1.5 rounded transition-all duration-300 ${selectedCategory === 'Pharmacies' ? 'bg-slate-850 border border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.05)]' : 'opacity-60'}`}>
            <div className="flex items-center space-x-1.5">
              <span>💊</span>
              <span className="text-slate-300">Pharmacies</span>
            </div>
            <span className="font-semibold text-slate-100 min-w-[20px] text-right flex items-center justify-end">
              {selectedCategory === 'Pharmacies' ? (loading ? <LoadingPlaceholder /> : <AnimatedCounter value={facilities.length} />) : <span className="text-slate-600">-</span>}
            </span>
          </div>
        </div>
      </div>
      
      {/* Zoom to Current Location Button */}
      <button 
        onClick={onZoomToLocation}
        className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 font-bold py-2 px-3 rounded-lg text-xs transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/10 border border-emerald-400/20"
      >
        <svg className="w-3.5 h-3.5 text-slate-950 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <span>Zoom to Location</span>
      </button>
    </div>
  );
};

export default LiveCounter;
