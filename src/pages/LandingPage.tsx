// src/pages/sPage.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FlaskConical, Boxes, ClipboardList, Download, Sun, Moon, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MolecularLogo } from '@/components/MolecularLogo';

// Utility: smooth scroll animation for the marquee
const useMarqueeAnimation = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes marquzee {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }
      .marquee { animation: marquee 12s linear infinite; }
      .marquee:hover { animation-play-state: paused; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
};

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [language, setLanguage] = useState<'nepali' | 'english'>('english');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const isDark = theme === 'dark';

  const handleGuestAccess = () => navigate('/library');

  // Feature definitions – keep concise for a cleaner UI
  const features = [
    { icon: FlaskConical, title: 'Virtual Experiments', description: 'Interactive lab simulations' },
    { icon: Boxes, title: '2D & 3D', description: 'Realistic visualizations' },
    { icon: ClipboardList, title: 'Auto Notes', description: 'Automatic documentation' },
    { icon: Download, title: 'Offline', description: 'Learn anywhere, anytime' },
  ];

  // Initialise marquee animation once
  useMarqueeAnimation();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
      {/* ==== Header ==== */}
      <nav className={`w-full h-16 px-6 flex items-center justify-between border-b transition-colors ${isDark ? 'bg-[#0B1120] border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <MolecularLogo size={32} />
          <div className="flex flex-col">
            <h1 className={`text-lg font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>VIRTUAL LAB</h1>
            <span className={`text-[10px] font-bold uppercase ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Simulator</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className={`text-sm font-medium hidden md:block ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-blue-500'}`}>Tutorials</a>
          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`rounded-full ${isDark ? 'text-yellow-400 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}>
            {isDark ? <Sun className="w-5 h-5 fill-yellow-400" /> : <Moon className="w-5 h-5 fill-slate-600" />}
          </Button>
          {/* Auth actions */}
          <Button onClick={() => navigate('/login')} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg">Log In</Button>
          <Button onClick={() => navigate('/login')} size="sm" variant="outline" className={`border ${isDark ? 'border-slate-600 text-black-200 hover:bg-white/10' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>Sign Up</Button>
        </div>
      </nav>

      {/* ==== Hero Section ==== */}
      <main className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
        {/* Background – subtle animated gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 opacity-30" />
        {/* Hero content */}
        <div className="relative z-10 w-full max-w-4xl px-6 text-center py-12">
          {/* Marquee – simplified */}
          <div className="mb-6 py-2 px-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white inline-block">
            <span className="marquee whitespace-nowrap text-sm font-semibold">✨ Learn & Experiment Like Never Before! ✨</span>
          </div>
          <h2 className={`text-4xl md:text-5xl font-extrabold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Step into a High‑Fidelity Virtual Lab</h2>
          <p className={`text-lg md:text-xl mb-8 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Conduct experiments, visualise molecules and master concepts with immersive interactivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGuestAccess} className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl rounded-xl">
              Start Learning for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-500 text-white">Sign In</Button>
          </div>
        </div>

        {/* ==== Feature Grid ==== */}
        <section className="w-full max-w-6xl px-6 mt-12 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className={`p-5 rounded-xl text-center backdrop-blur-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/30'} transition-transform hover:-translate-y-1 hover:shadow-2xl`}>
                  <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-lg ${isDark ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
                    <Icon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <h3 className={`text-xs font-bold uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}>{f.title}</h3>
                  <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{f.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==== Footer / Language Switch ==== */}
        <footer className={`w-full py-4 px-6 flex items-center justify-center ${isDark ? 'bg-black/40 border-white/10 text-slate-300' : 'bg-white/60 border-slate-200 text-slate-600'}`}>
          <span className="font-semibold mr-2">Language:</span>
          <button onClick={() => setLanguage(language === 'english' ? 'nepali' : 'english')} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/10 transition-colors">
            {language === 'english' ? 'English' : 'नेपाली'}
          </button>
        </footer>
      </main>
    </div>
  );
}
