import React, { useState } from 'react';
import GeospatialBackground from '../components/layout/GeospatialBackground';

const Signup = ({ onNavigate, onBackToMap, isAuthenticated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name) {
      setError('Name is required.');
      return;
    }
    if (!email) {
      setError('Email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (!confirmPassword) {
      setError('Please confirm your password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to create account. Please try again.');
      }

      setSuccess('Account created successfully! Redirecting to sign in...');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        onNavigate('login');
      }, 1500);

    } catch (err) {
      console.error(err);
      if (err.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server.');
      } else if (err.message.includes('already registered') || err.message.includes('already exists')) {
        setError('An account with this email already exists.');
      } else {
        setError(err.message || 'Unable to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center md:justify-end md:pr-24 p-4 bg-transparent overflow-y-auto select-none">
      <style>{`
        @keyframes authCardFloat {
          0% { transform: translateY(-5px) rotate(0.1deg); }
          50% { transform: translateY(5px) rotate(-0.1deg); }
          100% { transform: translateY(-5px) rotate(0.1deg); }
        }
        .auth-card-floating {
          animation: authCardFloat 9s ease-in-out infinite;
        }
      `}</style>
      <GeospatialBackground />
      
      {/* Navigation Directions Panel (Responsive Overlay HUD) */}
      <div className={`fixed top-4 left-4 right-4 md:right-auto md:left-8 md:top-8 md:w-80 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/45 rounded-2xl p-4 md:p-5 shadow-2xl flex flex-col gap-3 md:gap-4 animate-fade-in-header text-left transition-all duration-300 ${isNavExpanded ? 'h-auto' : 'h-auto max-h-[72px] md:max-h-none'}`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-xs tracking-wider uppercase">SIMULATED HUD</span>
            <span id="nav-status" className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold uppercase animate-pulse">NAVIGATING</span>
          </div>
          <button 
            onClick={() => setIsNavExpanded(!isNavExpanded)}
            className="text-slate-400 hover:text-slate-200 text-xs font-bold px-2 py-1 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/30 rounded transition-colors duration-150 cursor-pointer"
          >
            {isNavExpanded ? 'Collapse' : 'Details'}
          </button>
        </div>

        {/* Compact overview visible on mobile when collapsed */}
        {!isNavExpanded && (
          <div className="flex md:hidden items-center justify-between text-xs text-slate-300 font-semibold mt-1">
            <span id="nav-road" className="text-slate-200 truncate max-w-[140px]">Bhulabhai Desai Rd</span>
            <span id="nav-distance" className="text-emerald-400 font-bold">1.8 km</span>
          </div>
        )}

        {/* Full Details - always visible on desktop, toggleable on mobile */}
        <div className={`flex flex-col gap-3 md:gap-4 transition-all duration-300 ${isNavExpanded ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-semibold border-b border-slate-800 pb-3">
            <div className="flex justify-between">
              <span>Current Road:</span>
              <span id="nav-road" className="text-slate-200">Bhulabhai Desai Rd</span>
            </div>
            <div className="flex justify-between">
              <span>Distance Remaining:</span>
              <span id="nav-distance" className="text-slate-200">1.8 km</span>
            </div>
            <div className="flex justify-between">
              <span>Est. Time (ETA):</span>
              <span id="nav-eta" className="text-slate-200">5 min</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Route Progress</span>
              <span id="nav-progress-percent">0%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div id="nav-progress-bar" className="bg-emerald-500 h-full transition-all duration-300" style={{ width: '0%' }}></div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-800 pt-3">
            <div className="flex items-start gap-3 text-slate-400 text-xs">
              <span className="text-emerald-400 font-bold">↱</span>
              <div>
                <div className="text-slate-100 font-bold">Veer Nariman Rd</div>
                <div className="text-[10px] text-slate-500">In 700m - Turn right</div>
              </div>
            </div>
            <div className="flex items-start gap-3 text-slate-400 text-xs">
              <span className="text-emerald-400 font-bold">↰</span>
              <div>
                <div className="text-slate-100 font-bold">Maharshi Karve Rd</div>
                <div className="text-[10px] text-slate-500">In 1.2km - Turn left</div>
              </div>
            </div>
            <div className="flex items-start gap-3 text-slate-400 text-xs">
              <span className="text-emerald-400 font-bold">📍</span>
              <div>
                <div className="text-slate-100 font-bold">Bombay Hospital</div>
                <div className="text-[10px] text-slate-500">In 2.0km - Destination</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Badge (Bottom Left) */}
      <div className="hidden md:flex absolute left-8 bottom-8 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/45 rounded-xl px-4 py-2.5 shadow-xl items-center gap-2.5 text-left">
        <span className="text-emerald-400 text-lg">📍</span>
        <div>
          <div className="text-xs font-bold text-slate-100">Mumbai</div>
          <div className="text-[10px] text-slate-400">Maharashtra, India</div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-lg border border-slate-700/40 rounded-2xl p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col justify-center animate-fade-in-header auth-card-floating">
        
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-xl bg-emerald-500 items-center justify-center shadow-lg shadow-emerald-500/20 mb-3 active:scale-95 transition-transform duration-200">
            <svg className="w-5 h-5 text-slate-950 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.3 20c-2.22 0-4.317-.57-6.14-1.57z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-wider text-slate-100 leading-tight">
            Create <span className="text-emerald-400">Account</span>
          </h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Join the ResQMap Network</p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-medium leading-normal">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold leading-normal">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Mercer"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-4 pr-12 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-4 pr-12 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showConfirmPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all cursor-pointer flex items-center justify-center active:scale-98"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-sm">
          <span className="text-slate-400">Already have an account? </span>
          <button
            onClick={() => onNavigate('login')}
            className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
          >
            Sign In
          </button>
        </div>

        {isAuthenticated && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 text-center">
            <button
              onClick={onBackToMap}
              className="text-xs text-slate-500 hover:text-slate-300 font-medium bg-transparent border-none cursor-pointer p-0 flex items-center justify-center mx-auto space-x-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Back to Map Dashboard</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Signup;
