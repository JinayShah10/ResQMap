import React from 'react';
import { mockFacilities } from '../../data/mockFacilities';

const CATEGORIES = [
  { name: 'Hospitals', label: 'Hospitals', icon: '🏥' },
  { name: 'Police Stations', label: 'Police Stations', icon: '🚨' },
  { name: 'Fire Stations', label: 'Fire Stations', icon: '🚒' },
  { name: 'Pharmacies', label: 'Pharmacies', icon: '💊' },
  { name: 'Blood Banks', label: 'Blood Banks', icon: '🩸' },
];

const Sidebar = ({ 
  isSidebarOpen, 
  setIsSidebarOpen,
  selectedCategory,
  setSelectedCategory,
  selectedFacility,
  setSelectedFacility
}) => {
  const filteredFacilities = mockFacilities.filter(
    (facility) => facility.category === selectedCategory
  );

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

      {/* Emergency Categories Section */}
      <div className="p-4 border-b border-slate-800/80 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Categories</span>
          <span className="text-[10px] text-emerald-400/80 font-mono tracking-tighter">Phase 2</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((category, index) => {
            const isSelected = selectedCategory === category.name;
            return (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`border rounded-lg p-2 flex flex-col items-center justify-center space-y-1 active:scale-[0.98] transition-all duration-200 outline-none cursor-pointer ${
                  index === CATEGORIES.length - 1 ? 'col-span-2' : ''
                } ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-800/30 border-slate-700/40 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold shadow-inner transition-colors duration-200 ${
                  isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-200'
                }`}>
                  {category.icon}
                </div>
                <span className="text-[11px] font-semibold">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Facility Details Card (if active) */}
      {selectedFacility && (
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/20 animate-fade-in-sidebar shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Selected Detail</span>
            <button 
              onClick={() => setSelectedFacility(null)} 
              className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="bg-slate-800/40 border border-emerald-500/30 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-start gap-2">
              <h4 className="text-xs font-semibold text-slate-100">{selectedFacility.name}</h4>
              <span className="text-[9px] bg-slate-900 border border-slate-700 text-emerald-400 px-1.5 py-0.5 rounded font-medium shrink-0">
                {selectedFacility.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 flex items-start gap-1 leading-normal">
              <svg className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{selectedFacility.address}</span>
            </p>
            <p className="text-[11px] text-slate-300 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 00.996.808H12a1 1 0 00.996-.808l.548-2.2A1 1 0 0115.3 3H18.5a2 2 0 012 2v3.28a1 1 0 01-.725.94l-2.2.548a1 1 0 00-.808.996V14a1 1 0 00.808.996l2.2.548a1 1 0 01.725.94V18.5a2 2 0 01-2 2h-3.28a1 1 0 01-.94-.725l-.548-2.2a1 1 0 00-.996-.808H12a1 1 0 00-.996.808l-.548 2.2a1 1 0 01-.94.725H5a2 2 0 01-2-2v-3.28a1 1 0 01.725-.94l2.2-.548a1 1 0 00.808-.996V10a1 1 0 00-.808-.996l-2.2-.548A1 1 0 013 8.5V5z" />
              </svg>
              <span>{selectedFacility.phone}</span>
            </p>
          </div>
        </div>
      )}

      {/* Nearby Facility Results */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-4 pb-2 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {selectedCategory ? `${selectedCategory}` : 'Nearby Facilities'}
          </span>
          {selectedCategory && (
            <span className="text-[10px] text-slate-500 font-mono">
              {filteredFacilities.length} found
            </span>
          )}
        </div>
        
        {selectedCategory ? (
          filteredFacilities.length > 0 ? (
            <div className="p-4 pt-1 space-y-3 overflow-y-auto">
              {filteredFacilities.map((facility) => {
                const isSelected = selectedFacility?.id === facility.id;
                return (
                  <div
                    key={facility.id}
                    onClick={() => setSelectedFacility(facility)}
                    className={`border rounded-xl p-3.5 space-y-2 transition-all duration-300 cursor-pointer active:scale-[0.99] ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                        : 'bg-slate-800/20 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700/60'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-semibold text-slate-100 tracking-wide line-clamp-1">{facility.name}</h4>
                      {isSelected && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-medium shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
                      <svg className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{facility.address}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 00.996.808H12a1 1 0 00.996-.808l.548-2.2A1 1 0 0115.3 3H18.5a2 2 0 012 2v3.28a1 1 0 01-.725.94l-2.2.548a1 1 0 00-.808.996V14a1 1 0 00.808.996l2.2.548a1 1 0 01.725.94V18.5a2 2 0 01-2 2h-3.28a1 1 0 01-.94-.725l-.548-2.2a1 1 0 00-.996-.808H12a1 1 0 00-.996.808l-.548 2.2a1 1 0 01-.94.725H5a2 2 0 01-2-2v-3.28a1 1 0 01.725-.94l2.2-.548a1 1 0 00.808-.996V10a1 1 0 00-.808-.996l-2.2-.548A1 1 0 013 8.5V5z" />
                      </svg>
                      <span>{facility.phone}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 shrink-0">
              <span className="text-xs text-slate-500">No facilities found.</span>
            </div>
          )
        ) : (
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
        )}
      </div>

      {/* Footer Info Panel */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/10 text-[10px] text-slate-500 flex items-center justify-between font-mono shrink-0">
        <span>Map: MapLibre GL JS</span>
        <span className="text-emerald-500/80">● Status Active</span>
      </div>
    </aside>
  );
};

export default Sidebar;
