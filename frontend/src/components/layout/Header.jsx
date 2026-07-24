import React from 'react';

const Header = ({ mode, setMode, mapStyle, setMapStyle, isSidebarOpen, setIsSidebarOpen, onNavigate }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-50 px-4 md:px-6 flex items-center justify-between select-none animate-fade-in-header">
      {/* Mobile Hamburger & Logo */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 md:hidden focus:outline-none focus:ring-2 focus:ring-emerald-500/50 active:scale-95 transition-all duration-200 cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0 active:scale-95 transition-transform duration-200">
            <svg className="w-5 h-5 text-slate-950 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75h15m-15 3h15m-15 3h15m-15 3h15m-18-9v.008H3V6.75zm0 3v.008H3v-.008zm0 3v.008H3v-.008zm0 3v.008H3v-.008z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-wider text-slate-100 m-0 p-0 leading-tight">
              ResQ<span className="text-emerald-400">Map</span>
            </h1>
            <p className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest leading-none">Emergency Nav</p>
          </div>
        </div>
      </div>

      {/* Controls Container */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Map Style Selector with Sliding Indicator */}
        <div className="relative flex items-center bg-slate-950/40 p-1 rounded-lg border border-slate-800/80 shadow-inner select-none">
          {/* Sliding Background */}
          <div
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-md bg-emerald-500/20 border border-emerald-500/30 transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{
              transform: mapStyle === 'SATELLITE' ? 'translateX(100%)' : 'translateX(0%)',
            }}
          />
          <button
            onClick={() => setMapStyle('DARK')}
            className={`w-12 md:w-16 text-center py-1.5 relative z-10 text-[10px] md:text-xs font-semibold uppercase tracking-wider transition-colors duration-350 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded ${
              mapStyle === 'DARK' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setMapStyle('SATELLITE')}
            className={`w-12 md:w-16 text-center py-1.5 relative z-10 text-[10px] md:text-xs font-semibold uppercase tracking-wider transition-colors duration-350 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded ${
              mapStyle === 'SATELLITE' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sat
          </button>
        </div>

        {/* 2D / 3D Toggle Control with Sliding Indicator */}
        <div className="relative flex items-center bg-slate-950/40 p-1 rounded-lg border border-slate-800/80 shadow-inner select-none">
          {/* Sliding Background */}
          <div
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-md bg-emerald-500/20 border border-emerald-500/30 transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{
              transform: mode === '3D' ? 'translateX(100%)' : 'translateX(0%)',
            }}
          />
          <button
            onClick={() => setMode('2D')}
            className={`w-12 md:w-14 text-center py-1.5 relative z-10 text-[10px] md:text-xs font-semibold uppercase tracking-wider transition-colors duration-350 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded ${
              mode === '2D' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2D
          </button>
          <button
            onClick={() => setMode('3D')}
            className={`w-12 md:w-14 text-center py-1.5 relative z-10 text-[10px] md:text-xs font-semibold uppercase tracking-wider transition-colors duration-350 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded ${
              mode === '3D' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3D
          </button>
        </div>

        {/* Sign In Button */}
        <button
          onClick={() => onNavigate('login')}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors duration-250 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 active:scale-95 select-none"
        >
          Sign In
        </button>
      </div>
    </header>
  );
};

export default Header;
