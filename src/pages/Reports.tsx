import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { getCheckIns, getGoals, getGoalProgress } from '../lib/storage';
import { getLastNWeeks, formatWeekRange, getWeekStart } from '../lib/date';
import type { CheckIn, Goal, GoalProgress } from '../types';

export function Reports() {
  const { t, settings } = useSettings();
  const [weeks, setWeeks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(getWeekStart());
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progress, setProgress] = useState<GoalProgress[]>([]);

  useEffect(() => { setWeeks(getLastNWeeks(12)); loadData(); }, [selectedWeek]);

  async function loadData() {
    const [checkIns, goalsData, progressData] = await Promise.all([getCheckIns(), getGoals(), getGoalProgress()]);
    setCheckIn(checkIns.find((c) => c.weekStart === selectedWeek) || null);
    setGoals(goalsData);
    setProgress(progressData.filter((p) => p.weekStart === selectedWeek));
  }

  function handlePrint() { window.print(); }

  const completedGoals = goals.filter((g) => progress.some((p) => p.goalId === g.id && p.done));
  const incompleteGoals = goals.filter((g) => !progress.some((p) => p.goalId === g.id && p.done));

  return (
    <div className="reports">
      <div className="page-header no-print">
        <h2>{t.reports.title}</h2>
        <button className="btn btn-primary" onClick={handlePrint}>{t.reports.print}</button>
      </div>

      <div className="week-selector no-print">
        <label>{t.reports.selectWeek}</label>
        <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
          {weeks.map((week) => <option key={week} value={week}>{formatWeekRange(week, settings.language)}</option>)}
        </select>
      </div>

      <div className="report-content print-area">
        <h3 className="print-title">Weekly Report: {formatWeekRange(selectedWeek, settings.language)}</h3>

        {!checkIn ? <p className="no-data">{t.reports.noData}</p> : (
          <>
            <section className="report-section">
              <h4>{t.reports.summary}</h4>
              <table className="report-table">
                <tbody>
                  <tr><th>{t.checkin.mood}</th><td>{checkIn.mood}/5</td></tr>
                  <tr><th>{t.checkin.sleep}</th><td>{checkIn.sleep}/5</td></tr>
                  <tr><th>{t.checkin.exerciseCount}</th><td>{checkIn.exerciseCount}</td></tr>
                </tbody>
              </table>
            </section>
            <section className="report-section"><h4>{t.checkin.mealSummary}</h4><p className="report-text">{checkIn.mealSummary}</p></section>
            <section className="report-section"><h4>{t.checkin.exerciseSummary}</h4><p className="report-text">{checkIn.exerciseSummary}</p></section>
            {checkIn.obstacles && <section className="report-section"><h4>{t.checkin.obstacles}</h4><p className="report-text">{checkIn.obstacles}</p></section>}
            {checkIn.notes && <section className="report-section"><h4>{t.checkin.notes}</h4><p className="report-text">{checkIn.notes}</p></section>}
          </>
        )}

        <section className="report-section">
          <h4>{t.reports.goalAchievement}</h4>
          {goals.length === 0 ? <p className="no-data">{t.reports.noData}</p> : (
            <>
              <div className="goal-group"><h5>{t.reports.completed} ({completedGoals.length})</h5><ul className="report-goal-list">{completedGoals.map((g) => <li key={g.id} className="completed">{g.title}</li>)}</ul></div>
              <div className="goal-group"><h5>{t.reports.notCompleted} ({incompleteGoals.length})</h5><ul className="report-goal-list">{incompleteGoals.map((g) => <li key={g.id} className="incomplete">{g.title}</li>)}</ul></div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
