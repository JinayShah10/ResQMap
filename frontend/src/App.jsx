import { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MapView from './components/map/MapView';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const getInitialPage = () => {
    const path = window.location.pathname;
    const isAuth = !!localStorage.getItem('token');
    if (path === '/app') {
      return isAuth ? 'dashboard' : 'signup';
    }
    if (path === '/login') {
      return 'login';
    }
    return 'signup';
  };

  const [page, setPageState] = useState(getInitialPage);

  const setPage = (newPage) => {
    const isAuth = !!localStorage.getItem('token');
    if (newPage === 'dashboard') {
      if (isAuth) {
        setPageState('dashboard');
        window.history.pushState({}, '', '/app');
      } else {
        setPageState('signup');
        window.history.pushState({}, '', '/');
      }
    } else if (newPage === 'login') {
      setPageState('login');
      window.history.pushState({}, '', '/login');
    } else {
      setPageState('signup');
      window.history.pushState({}, '', '/');
    }
  };

  const handleLoginSuccess = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setPage('login');
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const isAuth = !!localStorage.getItem('token');
      setIsAuthenticated(isAuth);
      
      if (path === '/app') {
        setPageState(isAuth ? 'dashboard' : 'signup');
      } else if (path === '/login') {
        setPageState('login');
      } else {
        setPageState('signup');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    const path = window.location.pathname;
    const isAuth = !!localStorage.getItem('token');
    if (path === '/app' && !isAuth) {
      window.history.replaceState({}, '', '/');
      setPageState('signup');
    } else if (path === '/' && isAuth) {
      setPageState('dashboard');
      window.history.replaceState({}, '', '/app');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  const [mode, setMode] = useState('2D');
  const [mapStyle, setMapStyle] = useState('DARK');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);

  // If category changes, reset selected facility
  const handleSetCategory = (category) => {
    setSelectedCategory(category);
    setSelectedFacility(null);
  };

  // Render Authentication Pages
  if (page === 'login') {
    return <Login onNavigate={setPage} onBackToMap={() => setPage('dashboard')} isAuthenticated={isAuthenticated} onLoginSuccess={handleLoginSuccess} />;
  }

  if (page === 'signup') {
    return <Signup onNavigate={setPage} onBackToMap={() => setPage('dashboard')} isAuthenticated={isAuthenticated} />;
  }

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
        onNavigate={setPage}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      {/* Main Geospatial Interface */}
      <div className="relative flex-1 flex h-[calc(100vh-4rem)] mt-16 overflow-hidden">
        {/* Left Control Sidebar */}
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen}
          selectedCategory={selectedCategory}
          setSelectedCategory={handleSetCategory}
          selectedFacility={selectedFacility}
          setSelectedFacility={setSelectedFacility}
        />

        {/* Mobile Sidebar Backdrop Overlay */}
        <div
          onClick={() => setIsSidebarOpen(false)}
          className={`fixed inset-0 bg-slate-950/65 backdrop-blur-xs z-40 md:hidden transition-all duration-300 ease-in-out motion-reduce:transition-none ${
            isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Map Workspace */}
        <main className="flex-grow h-full relative">
          <MapView 
            mode={mode} 
            mapStyle={mapStyle} 
            selectedCategory={selectedCategory}
            selectedFacility={selectedFacility}
            setSelectedFacility={setSelectedFacility}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
