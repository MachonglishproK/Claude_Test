export interface NameDisplayProps {
  name: string
  onNameChange: (name: string) => void
}

export interface CounterProps {
  count: number
  onIncrement: () => void
  onDecrement: () => void
  onReset: () => void
}

export interface MemoProps {
  memo: string
  onMemoChange: (memo: string) => void
}

// Weekly Review Dashboard Types
export interface Goal {
  id: string;
  title: string;
  category: 'health' | 'work' | 'learning' | 'personal' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly';
  difficulty: 1 | 2 | 3 | 4 | 5;
  ifThen?: string;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  weekStart: string;
  mood: 1 | 2 | 3 | 4 | 5;
  sleep: 1 | 2 | 3 | 4 | 5;
  mealSummary: string;
  exerciseSummary: string;
  exerciseCount: number;
  obstacles: string;
  notes: string;
  createdAt: string;
}

export interface GoalProgress {
  id: string;
  goalId: string;
  weekStart: string;
  done: boolean;
}

export interface WizardDraft {
  step: number;
  data: Record<string, unknown>;
  savedAt: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  language: 'ja' | 'en';
}
