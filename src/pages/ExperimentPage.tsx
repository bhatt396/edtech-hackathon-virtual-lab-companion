import { useParams, useNavigate } from 'react-router-dom';
import { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { ProcedureSteps } from '@/components/lab/ProcedureSteps';
import { ObservationPanel } from '@/components/lab/ObservationPanel';
import { EXPERIMENTS } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Info, Clock, Target, Beaker } from 'lucide-react';
import SimpleDemo3D from '@/experiments/threeD/SimpleDemo3D';
import OhmsLaw2D from '@/experiments/twoD/OhmsLaw2D';
import OhmsLawAnimated from '@/experiments/animated/OhmsLawAnimated';
import ProjectileMotion2D from '@/experiments/twoD/ProjectileMotion2D';
import ProjectileMotionAnimated from '@/experiments/animated/ProjectileMotionAnimated';
import ProjectileMotion3D from '@/experiments/threeD/ProjectileMotion3D';

// New Imports
import AcidBaseTitration2D from '@/experiments/twoD/AcidBaseTitration2D';
import AcidBaseTitration3D from '@/experiments/threeD/AcidBaseTitration3D';
import AcidBaseTitrationAnimated from '@/experiments/animated/AcidBaseTitrationAnimated';
import SimplePendulum2D from '@/experiments/twoD/SimplePendulum2D';
import SimplePendulum3D from '@/experiments/threeD/SimplePendulum3D';
import SimplePendulumAnimated from '@/experiments/animated/SimplePendulumAnimated';
import MicroscopeObservation2D from '@/experiments/twoD/MicroscopeObservation2D';
import MicroscopeObservation3D from '@/experiments/threeD/MicroscopeObservation3D';
import MicroscopeObservationAnimated from '@/experiments/animated/MicroscopeObservationAnimated';
import { VivaQuestions } from '@/components/lab/VivaQuestions';
import { ExperimentAssistant } from '@/components/lab/ExperimentAssistant';

export function ExperimentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const experiment = EXPERIMENTS.find(e => e.id === id);

  // Determine mode type based on experiment
  const isProjectileMotion = experiment?.id === 'projectile-motion';
  const isAcidBase = experiment?.id === 'acid-base-titration';
  const isPendulum = experiment?.id === 'pendulum';
  const isOhmsLaw = experiment?.id === 'ohms-law';
  const isMicroscope = experiment?.id === 'microscope-observation';

  const [mode, setMode] = useState<'2d' | 'animated' | '3d'>('2d');

  if (!experiment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              Experiment not found
            </h1>
            <p className="text-muted-foreground mb-6">
              The experiment you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  // Check if experiment has simulation
  const hasSimulation = isOhmsLaw || isProjectileMotion || isAcidBase || isPendulum || isMicroscope;

  // Helper to render the correct component
  const renderSimulation = () => {
    switch (mode) {
      case '2d':
        if (isProjectileMotion) return <ProjectileMotion2D />;
        if (isOhmsLaw) return <OhmsLaw2D />;
        if (isAcidBase) return <AcidBaseTitration2D />;
        if (isPendulum) return <SimplePendulum2D />;
        if (isMicroscope) return <MicroscopeObservation2D />;
        return null;
      case '3d':
        if (isProjectileMotion) return <ProjectileMotion3D />;
        if (isOhmsLaw) return <SimpleDemo3D />; // Default for now
        if (isAcidBase) return <AcidBaseTitration3D />;
        if (isPendulum) return <SimplePendulum3D />;
        if (isMicroscope) return <MicroscopeObservation3D />;
        return <SimpleDemo3D />;
      case 'animated':
        if (isProjectileMotion) return <ProjectileMotionAnimated />;
        if (isOhmsLaw) return <OhmsLawAnimated />;
        if (isAcidBase) return <AcidBaseTitrationAnimated />;
        if (isPendulum) return <SimplePendulumAnimated />;
        if (isMicroscope) return <MicroscopeObservationAnimated />;
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden text-slate-200">
      {/* Cool Interactive Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <Navbar />

      <main className="container relative z-10 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => {
              if (isAuthenticated) navigate(-1);
              else navigate('/library');
            }}
            className="mb-6 gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {isAuthenticated ? 'Back to Dashboard' : 'Browse Library'}
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {experiment.title}
                </h1>
                <Badge variant="outline" className="capitalize">
                  {experiment.subject}
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                {experiment.description}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{experiment.duration}</span>
              </div>
              <Badge variant="secondary" className="capitalize">
                {experiment.difficulty}
              </Badge>
            </div>
          </div>
        </div>

        {mode === '3d' && hasSimulation ? (
          // Full-width 3D view
          <div className="animate-slide-up">
            <div className="mb-4 flex gap-2 items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMode('2d')}>
                  2D View
                </Button>
                <Button variant="outline" onClick={() => setMode('animated')}>
                  Animated
                </Button>
                <Button variant="default" onClick={() => setMode('3d')}>
                  3D View
                </Button>
              </div>
            </div>
            {renderSimulation()}
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Simulation & Observations */}
            <div className="lg:col-span-2 space-y-6">
              {/* Simulation Canvas */}
              {hasSimulation ? (
                <div className="animate-slide-up">
                  <div className="mb-4 flex gap-2">
                    <Button variant={mode === '2d' ? 'default' : 'outline'} onClick={() => setMode('2d')}>
                      2D View
                    </Button>
                    <Button variant={mode === 'animated' ? 'default' : 'outline'} onClick={() => setMode('animated')}>
                      Animated
                    </Button>
                    <Button variant={mode === '3d' ? 'default' : 'outline'} onClick={() => setMode('3d')}>
                      3D View
                    </Button>
                  </div>

                  <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                    {renderSimulation()}
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-muted/50 border border-border text-center animate-fade-in">
                  <Beaker className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
                  <h3 className="font-display font-semibold text-foreground mb-2">
                    Simulation Coming Soon
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The interactive simulation for this experiment is under development.
                  </p>
                </div>
              )}

              {/* Observation Panel */}
              {hasSimulation && (
                <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                  {isAuthenticated ? (
                    <ObservationPanel experimentId={id} />
                  ) : (
                    <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20 backdrop-blur-sm text-center">
                      <Beaker className="h-10 w-10 mx-auto mb-4 text-primary opacity-60" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Ready to record results?</h3>
                      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                        Sign in to use the digital observation notebook and save your experiment data.
                      </p>
                      <Button onClick={() => navigate('/login')} className="gap-2">
                        Sign In to Record
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Info & Procedure */}
            <div className="space-y-6">
              {/* Objectives */}
              <div className="p-4 rounded-xl bg-card border border-border animate-slide-up" style={{ animationDelay: '50ms' }}>
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-primary" />
                  Objectives
                </h3>
                <ul className="space-y-2">
                  {experiment.objectives.map((obj, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {index + 1}
                      </span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Apparatus */}
              <div className="p-4 rounded-xl bg-card border border-border animate-slide-up" style={{ animationDelay: '100ms' }}>
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Beaker className="h-4 w-4 text-secondary" />
                  Apparatus Required
                </h3>
                <div className="flex flex-wrap gap-2">
                  {experiment.apparatus.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Procedure Steps */}
              {hasSimulation && (
                <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
                  <ProcedureSteps steps={experiment.steps} />
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground text-sm mb-1">Did you know?</h4>
                    <p className="text-xs text-muted-foreground">
                      {experiment.subject === 'physics' && "Ohm's Law was discovered by Georg Simon Ohm in 1827. It forms the foundation of electrical circuit analysis."}
                      {experiment.subject === 'chemistry' && "The word 'titration' comes from the French word 'titre', meaning 'title' or 'standard'."}
                      {experiment.subject === 'biology' && "The first microscope was invented by Zacharias Janssen around 1590."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Viva Questions */}
              <div className="animate-slide-up" style={{ animationDelay: '250ms' }}>
                {isAuthenticated ? (
                  <VivaQuestions experimentId={experiment.id} />
                ) : (
                  <div className="p-6 rounded-xl bg-card border border-border text-center">
                    <h4 className="font-semibold text-foreground mb-2 text-sm">Practice Viva Questions</h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      Complete the experiment and test your knowledge.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => navigate('/login')} className="w-full text-xs">
                      Sign In to Take Quiz
                    </Button>
                  </div>
                )}
              </div>
              <ExperimentAssistant experiment={experiment} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
