import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FlaskConical, Boxes, ClipboardList, Download, Sun, Moon, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MolecularLogo } from '@/components/MolecularLogo';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [language, setLanguage] = useState<'nepali' | 'english'>('english');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const handleGuestAccess = () => {
    navigate('/library');
  };

  const features = [
    {
      icon: FlaskConical,
      title: 'Virtual Experiments',
      description: 'Interactive lab simulations',
    },
    {
      icon: Boxes,
      title: '2D & 3D Simulations',
      description: 'Realistic visualizations',
    },
    {
      icon: ClipboardList,
      title: 'Auto Practical Notes',
      description: 'Automatic documentation',
    },
    {
      icon: Download,
      title: 'Offline Learning',
      description: 'Learn anywhere, anytime',
    },
  ];

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>

      {/* 1. Distinct Top Header Bar */}
      <nav className={`w-full h-16 px-6 flex items-center justify-between border-b z-50 transition-colors ${isDark
        ? 'bg-[#0B1120] border-white/5'
        : 'bg-white border-slate-200'
        }`}>
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <MolecularLogo size={32} />
          <div className="flex flex-col">
            <h1 className={`text-lg font-black tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
              VIRTUAL LAB
            </h1>
            <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Simulator
            </span>
          </div>
        </div>

        {/* Right: Navigation & Actions */}
        <div className="flex items-center gap-6">
          <a href="#" className={`text-sm font-medium hover:text-blue-500 transition-colors hidden md:block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Tutorials
          </a>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`rounded-full w-9 h-9 transition-colors ${isDark ? 'text-yellow-400 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {isDark ? <Sun className="w-5 h-5 fill-yellow-400" /> : <Moon className="w-5 h-5 fill-slate-600" />}
          </Button>

          <div className="h-6 w-px bg-slate-700/50 hidden md:block" />

          <div className="flex gap-3">
            <button
              onClick={handleGuestAccess}
              className={`hidden md:block text-xs font-bold uppercase tracking-wider hover:underline transition-all ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Try Guest
            </button>
            <Button
              onClick={() => navigate('/login')}
              size="sm"
              className="px-6 font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 border-0"
            >
              Log In
            </Button>
            <Button
              onClick={() => navigate('/login')}
              size="sm"
              variant="outline"
              className={`px-6 font-semibold ${isDark
                ? 'bg-transparent border-slate-600 text-slate-200 hover:bg-white/10 hover:text-white'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* 2. Main Hero Section */}
      <main className="relative flex-1 flex flex-col items-center justify-center w-full overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/background.png"
            alt="Lab Background"
            className={`w-full h-full object-cover transition-all duration-700 ${isDark
              ? 'brightness-[0.85] contrast-[1.1]'
              : 'brightness-[1.05] contrast-[0.95] opacity-90'
              }`}
          />
          {/* Content Overlay Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-t ${isDark
            ? 'from-[#0F172A] via-[#0F172A]/40 to-transparent'
            : 'from-slate-50 via-slate-50/40 to-transparent'
            }`} />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center h-full pt-10 pb-6">

          {/* Marquee Pill */}
          <div className={`mb-8 py-2 px-6 rounded-full border backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] max-w-md w-full overflow-hidden relative group cursor-default transition-all hover:scale-105 ${isDark
            ? 'bg-blue-950/40 border-blue-400/20 text-blue-200'
            : 'bg-white/60 border-blue-200 text-blue-700'
            }`}>
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes scroll {
                  0% { transform: translateX(100%); }
                  100% { transform: translateX(-100%); }
                }
                .animate-scroll {
                  animation: scroll 10s linear infinite;
                }
                .group:hover .animate-scroll {
                  animation-play-state: paused;
                }
              `}} />
            <div className="w-full overflow-hidden flex items-center justify-center">
              <div className="animate-scroll whitespace-nowrap">
                <span className="text-sm font-semibold tracking-wider">✨ Learn & Experiment Like Never Before! ✨</span>
              </div>
            </div>
          </div>

          {/* Main Titles */}
          <div className="text-center space-y-4 max-w-4xl mb-auto mt-4">

            <p className={`text-lg md:text-2xl font-bold max-w-2xl mx-auto leading-relaxed drop-shadow-md ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Step into a high-fidelity virtual laboratory. Conduct experiments, visualize molecular structures, and master concepts with immersive interactivity.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/library')}
                className="bg-blue-600 hover:bg-blue-500 text-white h-14 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-blue-500/20 gap-2 transition-all hover:scale-105 active:scale-95"
              >
                Start Learning for Free
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className={`h-14 px-10 text-lg font-semibold rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 ${isDark
                  ? 'border-slate-700 text-white hover:bg-white/5'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                  }`}
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-8 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={`relative overflow-hidden rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group ${isDark
                  ? 'bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20'
                  : 'bg-white/70 backdrop-blur-md border border-white/50 shadow-lg shadow-slate-200/50'
                  }`}>
                  <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-inner ${isDark
                    ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                    : 'bg-gradient-to-br from-blue-100 to-purple-100'
                    }`}>
                    <Icon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer / Language */}
          <div className={`mt-auto py-2 px-6 rounded-full backdrop-blur-md border shadow-lg flex items-center gap-3 ${isDark ? 'bg-black/40 border-white/10 text-sm text-slate-300' : 'bg-white/60 border-slate-200 text-sm text-slate-600'
            }`}>
            <span className="font-semibold">Language:</span>
            <button
              onClick={() => setLanguage(language === 'english' ? 'nepali' : 'english')}
              className={`px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors font-medium border border-white/10`}
            >
              {language === 'english' ? 'English' : 'नयनी'}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

