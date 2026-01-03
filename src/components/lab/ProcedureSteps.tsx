import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Volume2, VolumeX, Zap } from 'lucide-react';
import { ExperimentStep } from '@/utils/constants';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ProcedureStepsProps {
  steps?: ExperimentStep[];
}

const FUNNY_INTROS = [
  "Alright future Nobel Prize winner, let's do this.",
  "Don't panic! It's just science. Next step:",
  "Focus! We're doing science here.",
  "Okay, pay attention, this part is cool.",
  "Moving on! Try not to blow anything up.",
  "Great job so far. Now for the tricky bit.",
  "Keep going! You're doing better than my last student.",
  "Science is messy, but let's try to be precise here.",
];

const FUNNY_OUTROS = [
  "Easy peasy, right?",
  "Boom! Science.",
  "Look at you go!",
  "I hope you wrote that down.",
  "You're a natural!",
];

const getHumorousNarration = (step: ExperimentStep, index: number, total: number) => {
  let intro = "";
  let outro = "";

  if (index === 0) {
    intro = "Welcome to the lab! I'll be your virtual assistant today. Let's get started with step one.";
  } else if (index === total - 1) {
    intro = "Almost there! Last step.";
    outro = "And you're done! Congratulations, you survived!";
  } else {
    intro = FUNNY_INTROS[index % FUNNY_INTROS.length];
    if (index % 3 === 0) outro = FUNNY_OUTROS[index % FUNNY_OUTROS.length];
  }

  // Add pauses with punctuation
  return `${intro} ... ${step.title}. ... ${step.description} ... ${outro}`;
};

export function ProcedureSteps({ steps = [] }: ProcedureStepsProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(0.85); // Default to slower, clearer speed
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const stepsRef = useRef(steps);

  // Keep ref updated for closure in onEnd key
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  const { speak, cancel, isSpeaking, isSupported } = useTextToSpeech();

  const toggleStep = (stepId: number) => {
    setCompletedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  // Effect to trigger play when activeStepIndex changes (and audio is enabled)
  useEffect(() => {
    if (isAudioEnabled && activeStepIndex >= 0 && activeStepIndex < steps.length && !isSpeaking) {
      const step = steps[activeStepIndex];
      const narration = getHumorousNarration(step, activeStepIndex, steps.length);

      const timer = setTimeout(() => {
        speak(narration, {
          rate: playbackRate,
          onEnd: () => {
            if (isAudioEnabled) {
              setActiveStepIndex(prev => {
                const next = prev + 1;
                if (next >= stepsRef.current.length) {
                  return -1;
                }
                return next;
              });
            } else {
              setActiveStepIndex(-1);
            }
          }
        });
      }, 700);

      return () => {
        clearTimeout(timer);
        cancel();
      };
    } else if (!isAudioEnabled || activeStepIndex === -1 || activeStepIndex >= steps.length) {
      cancel();
    }
  }, [activeStepIndex, isAudioEnabled, steps, playbackRate, speak, isSpeaking, cancel]);


  const handleSpeakStep = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (activeStepIndex === index && isSpeaking) {
      cancel();
      setActiveStepIndex(-1);
    } else {
      cancel();
      setActiveStepIndex(index);
    }
  };

  const toggleSpeed = () => {
    const speeds = [0.8, 0.85, 1, 1.2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackRate(speeds[nextIndex]);
    if (isSpeaking) {
      cancel();
      setActiveStepIndex(-1);
    }
  };

  if (!steps || steps.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-center text-muted-foreground">
        No procedure steps available for this experiment.
      </div>
    );
  }

  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <h3 className="font-display font-semibold text-foreground">Procedure Steps</h3>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
            {completedSteps.length}/{steps.length}
          </span>
        </div>

        {isSupported && (
          <div className="flex items-center gap-4">
            {isAudioEnabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSpeed}
                className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                title="Change playback speed"
              >
                <Zap className="h-3 w-3 mr-1" />
                {playbackRate}x
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Label htmlFor="audio-mode" className={`text-xs font-medium cursor-pointer ${isAudioEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
                {isAudioEnabled ? 'Assistant Active' : 'Start Assistant'}
              </Label>
              <Switch
                id="audio-mode"
                checked={isAudioEnabled}
                onCheckedChange={(checked) => {
                  setIsAudioEnabled(checked);
                  if (checked) {
                    if (activeStepIndex === -1 || activeStepIndex >= steps.length) {
                      setActiveStepIndex(0);
                    }
                  } else {
                    cancel();
                    setActiveStepIndex(-1);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          <div className="px-4 pt-4 pb-2">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="p-4 space-y-3">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              return (
                <div
                  key={step.id}
                  onClick={() => toggleStep(step.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-200 cursor-pointer ${isCompleted
                      ? 'bg-secondary/10 border border-secondary/30'
                      : 'bg-muted/50 hover:bg-muted border border-transparent'
                    }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-secondary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium ${isCompleted ? 'text-secondary' : 'text-foreground'}`}>
                        Step {step.id}: {step.title}
                      </p>

                      {isAudioEnabled && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-6 w-6 shrink-0 rounded-full hover:bg-primary/20 hover:text-primary ${activeStepIndex === index ? 'text-primary bg-primary/10' : ''
                            }`}
                          onClick={(e) => handleSpeakStep(e, index)}
                          aria-label={`Listen to Step ${step.id}`}
                        >
                          {isSpeaking && activeStepIndex === index ? (
                            <VolumeX className="h-3.5 w-3.5 animate-pulse" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {completedSteps.length === steps.length && (
            <div className="p-4 bg-secondary/10 border-t border-secondary/20 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-sm text-secondary font-medium text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                All steps completed! You can now record your observations.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
