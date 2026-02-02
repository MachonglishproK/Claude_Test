import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings } from '../hooks/useSettings';
import { getGoals, addGoal, updateGoal, deleteGoal, getGoalProgress, toggleGoalProgress } from '../lib/storage';
import { getWeekStart } from '../lib/date';
import type { Goal, GoalProgress } from '../types';

const schema = z.object({
  title: z.string().min(1, 'Required'),
  category: z.enum(['health', 'work', 'learning', 'personal', 'other']),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  difficulty: z.number().min(1).max(5),
  ifThen: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function Goals() {
  const { t } = useSettings();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progress, setProgress] = useState<GoalProgress[]>([]);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showForm, setShowForm] = useState(false);

  const weekStart = getWeekStart();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', category: 'personal', frequency: 'weekly', difficulty: 3, ifThen: '' },
  });

  const difficulty = watch('difficulty');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [goalsData, progressData] = await Promise.all([getGoals(), getGoalProgress()]);
    setGoals(goalsData);
    setProgress(progressData);
  }

  function openAddForm() {
    reset({ title: '', category: 'personal', frequency: 'weekly', difficulty: 3, ifThen: '' });
    setEditingGoal(null);
    setShowForm(true);
  }

  function openEditForm(goal: Goal) {
    reset({ title: goal.title, category: goal.category, frequency: goal.frequency, difficulty: goal.difficulty, ifThen: goal.ifThen || '' });
    setEditingGoal(goal);
    setShowForm(true);
  }

  function closeForm() { setShowForm(false); setEditingGoal(null); }

  async function onSubmit(data: FormData) {
    if (editingGoal) {
      await updateGoal({ ...editingGoal, ...data, difficulty: data.difficulty as 1|2|3|4|5 });
    } else {
      await addGoal({ id: crypto.randomUUID(), ...data, difficulty: data.difficulty as 1|2|3|4|5, createdAt: new Date().toISOString() });
    }
    await loadData();
    closeForm();
  }

  async function handleDelete(id: string) {
    if (confirm(t.data.confirmClear)) { await deleteGoal(id); await loadData(); }
  }

  async function handleToggleProgress(goalId: string) {
    await toggleGoalProgress(goalId, weekStart);
    await loadData();
  }

  function isGoalDone(goalId: string): boolean {
    return progress.some((p) => p.goalId === goalId && p.weekStart === weekStart && p.done);
  }

  return (
    <div className="goals">
      <div className="page-header">
        <h2>{t.goals.title}</h2>
        <button className="btn btn-primary" onClick={openAddForm}>{t.goals.add}</button>
      </div>

      <h3 className="section-title">{t.goals.thisWeek}</h3>

      {goals.length === 0 ? <p className="no-data">{t.goals.add}</p> : (
        <ul className="goals-list">
          {goals.map((goal) => (
            <li key={goal.id} className={`goal-card ${isGoalDone(goal.id) ? 'done' : ''}`}>
              <div className="goal-check">
                <input type="checkbox" checked={isGoalDone(goal.id)} onChange={() => handleToggleProgress(goal.id)} id={`goal-${goal.id}`} />
              </div>
              <div className="goal-content">
                <label htmlFor={`goal-${goal.id}`} className="goal-title">{goal.title}</label>
                <div className="goal-meta">
                  <span className="goal-category">{t.goals.categories[goal.category]}</span>
                  <span className="goal-frequency">{t.goals.frequencies[goal.frequency]}</span>
                  <span className="goal-difficulty">{'★'.repeat(goal.difficulty)}{'☆'.repeat(5 - goal.difficulty)}</span>
                </div>
                {goal.ifThen && <p className="goal-ifthen">{goal.ifThen}</p>}
              </div>
              <div className="goal-actions">
                <button className="btn btn-small" onClick={() => openEditForm(goal)}>{t.goals.edit}</button>
                <button className="btn btn-small btn-danger" onClick={() => handleDelete(goal.id)}>{t.goals.delete}</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="dialog-overlay">
          <div className="dialog goal-form-dialog">
            <h3>{editingGoal ? t.goals.edit : t.goals.add}</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label>{t.goals.titleLabel}</label>
                <input type="text" {...register('title')} className={errors.title ? 'error' : ''} />
              </div>
              <div className="form-group">
                <label>{t.goals.category}</label>
                <select {...register('category')}>
                  {(['health', 'work', 'learning', 'personal', 'other'] as const).map((cat) => <option key={cat} value={cat}>{t.goals.categories[cat]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>{t.goals.frequency}</label>
                <select {...register('frequency')}>
                  {(['daily', 'weekly', 'monthly'] as const).map((freq) => <option key={freq} value={freq}>{t.goals.frequencies[freq]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>{t.goals.difficulty}</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className={`rating-btn ${difficulty === value ? 'selected' : ''}`} onClick={() => setValue('difficulty', value)}>{value}</button>)}
                </div>
              </div>
              <div className="form-group">
                <label>{t.goals.ifThen}</label>
                <input type="text" {...register('ifThen')} placeholder={t.goals.ifThenPlaceholder} />
              </div>
              <div className="dialog-buttons">
                <button type="submit" className="btn btn-primary">{t.goals.save}</button>
                <button type="button" className="btn btn-secondary" onClick={closeForm}>{t.goals.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
