import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { MolecularLogo } from '@/components/MolecularLogo';

export function Login() {
  const { signInWithGoogle } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast.success(isLoginTab ? 'Signed in successfully!' : 'Account created successfully!');
    } catch (error: any) {
      console.error("Authentication Error:", error);
      // specific error handling
      if (error.code === 'auth/popup-blocked') {
        toast.error('Popup was blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled.');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('Domain not authorized in Firebase Console.');
      } else {
        toast.error(`Auth Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl opacity-50" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <MolecularLogo size={56} />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
            VirtualLab
          </h1>
          <p className="mt-2 text-muted-foreground font-medium uppercase tracking-widest text-[10px]">
            Future of Science Education
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/40 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-50" />

          {/* Custom Tabs */}
          <div className="flex p-1 bg-muted/50 rounded-xl mb-8 border border-border/50">
            <button
              onClick={() => setIsLoginTab(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLoginTab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLoginTab(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLoginTab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Sign Up
            </button>
          </div>

          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {isLoginTab ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {isLoginTab
                  ? 'Enter your virtual laboratory to continue your research.'
                  : 'Join thousands of students and teachers exploring science.'}
              </p>
            </div>

            <div className="py-4">
              <Button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                size="lg"
                className="w-full h-14 text-base gap-3 rounded-2xl shadow-xl hover:shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] bg-foreground text-background hover:bg-foreground/90"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  isLoginTab ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />
                )}
                {isLoginTab ? 'Continue with Google' : 'Sign up with Google'}
              </Button>
            </div>

            <div className="flex items-center gap-4 py-2 opacity-50">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase font-bold tracking-tighter">Secure OAuth 2.0</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="flex items-center gap-3 justify-center text-xs text-muted-foreground">
              <div className="p-2 rounded-lg bg-primary/5">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <p className="text-left leading-tight">
                Get instant access to AI-powered lab assistants and real-time physics simulations.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] text-muted-foreground/60 max-w-[280px] mx-auto leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
