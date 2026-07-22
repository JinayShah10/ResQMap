import React from 'react';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <aside className={`fixed md:static inset-y-0 md:inset-y-auto left-0 md:top-16 md:bottom-0 w-80 bg-slate-900/95 md:bg-slate-900/90 backdrop-blur-md border-r border-slate-800 z-50 md:z-40 flex flex-col shadow-2xl md:shadow-none transition-transform duration-300 ease-in-out motion-reduce:transition-none animate-fade-in-sidebar ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    }`}>
      {/* Mobile Drawer Header with Close Button */}
      <div className="p-4 border-b border-slate-800/60 flex items-center justify-between md:hidden bg-slate-950/40">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-slate-950 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75h15m-15 3h15m-15 3h15m-15 3h15m-18-9v.008H3V6.75zm0 3v.008H3v-.008zm0 3v.008H3v-.008zm0 3v.008H3v-.008z" />
            </svg>
          </div>
          <span className="font-bold text-slate-100 text-sm tracking-wider">ResQMap</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md active:scale-95 transition-all duration-200 cursor-pointer"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search Input Placeholder */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="relative">
          <input
            type="text"
            disabled
            placeholder="Search address or facility..."
            className="w-full bg-slate-950/30 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-lg py-2 pl-3 pr-10 text-sm cursor-not-allowed outline-none focus:border-slate-700 transition-colors"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Emergency Categories Placeholder */}
      <div className="p-4 border-b border-slate-800/80 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Categories</span>
          <span className="text-[10px] text-emerald-400/80 font-mono tracking-tighter">V1 Planned</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['Hospital', 'Pharmacy', 'Fire Station', 'Police'].map((category) => (
            <button
              key={category}
              disabled
              className="bg-slate-800/30 border border-slate-700/40 rounded-lg p-2.5 text-center flex flex-col items-center justify-center space-y-1.5 cursor-not-allowed opacity-80 hover:bg-slate-800/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 outline-none"
            >
              <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-100 flex items-center justify-center text-xs font-semibold shadow-inner">
                {category[0]}
              </div>
              <span className="text-xs text-slate-300 font-medium">{category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nearby Facility Results Placeholder */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-4 pb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nearby Facilities</span>
        </div>
        
        {/* Placeholder List items */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 bg-slate-950/20">
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-300">Ready for Discovery</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
              Select an emergency facility category to search nearby locations.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info Panel */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/10 text-[10px] text-slate-500 flex items-center justify-between font-mono">
        <span>Map: MapLibre GL JS</span>
        <span className="text-emerald-500/80">● Status Active</span>
      </div>
    </aside>
  );
};

export default Sidebar;
