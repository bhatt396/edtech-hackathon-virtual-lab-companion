import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { FlaskConical, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

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
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(user ? `/${user.role}` : '/')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-soft">
            <FlaskConical className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-semibold text-foreground">
              VirtualLab
            </span>
            <span className="text-xs text-muted-foreground">
              Interactive Science Simulator
            </span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{user.name}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                {user.role}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
