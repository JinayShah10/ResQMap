import React, { useState } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MapView from './components/map/MapView';

function App() {
  const [mode, setMode] = useState('2D');
  const [mapStyle, setMapStyle] = useState('DARK');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col text-slate-100">
      {/* Header Branding & Controls */}
      <Header 
        mode={mode} 
        setMode={setMode} 
        mapStyle={mapStyle}
        setMapStyle={setMapStyle}
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />

      {/* Main Geospatial Interface */}
      <div className="relative flex-1 flex h-[calc(100vh-4rem)] mt-16 overflow-hidden">
        {/* Left Control Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        {/* Mobile Sidebar Backdrop Overlay */}
        <div
          onClick={() => setIsSidebarOpen(false)}
          className={`fixed inset-0 bg-slate-950/65 backdrop-blur-xs z-40 md:hidden transition-all duration-300 ease-in-out motion-reduce:transition-none ${
            isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Map Workspace */}
        <main className="flex-grow h-full relative">
          <MapView mode={mode} mapStyle={mapStyle} />
        </main>
      </div>
    </div>
  );
}

export default App;
