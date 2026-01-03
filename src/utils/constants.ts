import EXPERIMENTS_DATA from '@/data/experiments.json';

export const SUBJECTS = {
  PHYSICS: 'physics',
  CHEMISTRY: 'chemistry',
  BIOLOGY: 'biology',
} as const;

export type Subject = typeof SUBJECTS[keyof typeof SUBJECTS];

export interface ExperimentStep {
  id: number;
  title: string;
  description: string;
}

export interface Experiment {
  id: string;
  title: string;
  subject: Subject;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  objectives: string[];
  apparatus: string[];
  steps?: ExperimentStep[];
  isCompleted?: boolean;
  isAssigned?: boolean;
}

export const EXPERIMENTS: Experiment[] = EXPERIMENTS_DATA as Experiment[];

export const getSubjectColor = (subject: Subject): string => {
  switch (subject) {
    case SUBJECTS.PHYSICS:
      return 'physics';
    case SUBJECTS.CHEMISTRY:
      return 'chemistry';
    case SUBJECTS.BIOLOGY:
      return 'biology';
    default:
      return 'primary';
  }
};

export const getSubjectGradient = (subject: Subject): string => {
  switch (subject) {
    case SUBJECTS.PHYSICS:
      return 'from-physics to-primary';
    case SUBJECTS.CHEMISTRY:
      return 'from-chemistry to-accent';
    case SUBJECTS.BIOLOGY:
      return 'from-biology to-secondary';
    default:
      return 'from-primary to-secondary';
  }
};

