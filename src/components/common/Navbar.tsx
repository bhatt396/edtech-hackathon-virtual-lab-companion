import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { MolecularLogo } from '@/components/MolecularLogo';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate(user && user.role ? `/${user.role}` : '/library')}
        >
          <MolecularLogo size={24} />
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              VirtualLab
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Simulator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/library')}
            className="hidden md:flex"
          >
            Library
          </Button>

          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-4">
              <div
                className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => user.role && navigate(`/${user.role}`)}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                  {user.displayName || 'User'}
                </span>
                {user.role && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                    {user.role}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign Out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate('/login')} size="sm" className="gap-2">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
