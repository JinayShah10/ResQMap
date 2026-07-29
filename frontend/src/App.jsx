import { useState, useEffect, useRef } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import LiveCounter from './components/layout/LiveCounter';
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

  // States for live facilities
  const [userLocation, setUserLocation] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zoomToUserLocationTrigger, setZoomToUserLocationTrigger] = useState(0);

  // Callback to track user location updates
  const handleUserLocationChange = (location) => {
    setUserLocation((prev) => {
      if (prev && prev.latitude === location.latitude && prev.longitude === location.longitude) {
        return prev;
      }
      return location;
    });
  };

  // Performance Cache Ref
  const cacheRef = useRef({});

  // Fetch facilities when category or user location changes
  useEffect(() => {
    if (!userLocation || !selectedCategory) {
      setFacilities([]);
      return;
    }

    // Map UI category label to API expected key
    const mapCategoryToApi = (uiCategory) => {
      switch (uiCategory) {
        case 'Hospitals': return 'hospital';
        case 'Police Stations': return 'police';
        case 'Fire Stations': return 'fire_station';
        case 'Pharmacies': return 'pharmacy';
        default: return null;
      }
    };

    const apiCategory = mapCategoryToApi(selectedCategory);
    if (!apiCategory) {
      setFacilities([]);
      return;
    }

    // Coordinates rounded to 4 decimal places (~11m precision) to act as location boundary
    const roundedLat = parseFloat(userLocation.latitude).toFixed(4);
    const roundedLng = parseFloat(userLocation.longitude).toFixed(4);
    const cacheKey = `${roundedLat},${roundedLng},${apiCategory},5000`;

    // Try reading cache
    if (cacheRef.current[cacheKey]) {
      setFacilities(cacheRef.current[cacheKey]);
      return;
    }

    let isMounted = true;

    const fetchFacilities = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:5002/api/facilities?lat=${userLocation.latitude}&lng=${userLocation.longitude}&category=${apiCategory}`
        );
        if (!response.ok) {
          throw new Error('Unable to fetch live facilities. Please try again.');
        }
        const data = await response.json();
        
        // Map backend keys to keys expected by frontend components
        const mapApiToUiCategory = (apiCat) => {
          switch (apiCat) {
            case 'hospital': return 'Hospitals';
            case 'police': return 'Police Stations';
            case 'fire_station': return 'Fire Stations';
            case 'pharmacy': return 'Pharmacies';
            default: return apiCat;
          }
        };

        const formattedData = data.map((item) => ({
          ...item,
          category: mapApiToUiCategory(item.category),
          latitude: item.lat,
          longitude: item.lng
        }));

        if (isMounted) {
          // Cache successful request
          cacheRef.current[cacheKey] = formattedData;
          setFacilities(formattedData);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Unable to fetch live facilities. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Debounce searches by 300ms
    const timer = setTimeout(() => {
      fetchFacilities();
    }, 300);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [userLocation?.latitude, userLocation?.longitude, selectedCategory]);

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
          facilities={facilities}
          loading={loading}
          error={error}
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
            facilities={facilities}
            onUserLocationChange={handleUserLocationChange}
            zoomToUserLocationTrigger={zoomToUserLocationTrigger}
          />
        </main>

        {/* Floating Live Counter Card (Top-Right Overlapping Map) */}
        <LiveCounter 
          selectedCategory={selectedCategory} 
          loading={loading} 
          facilities={facilities} 
          onZoomToLocation={() => setZoomToUserLocationTrigger(prev => prev + 1)}
        />
      </div>
    </div>
  );

}

export default App;
