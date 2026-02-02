import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useSettings } from '../hooks/useSettings';
import { getCheckIns, getGoals, getGoalProgress } from '../lib/storage';
import { getLastNWeeks, getWeekStart, formatDate } from '../lib/date';
import type { Goal } from '../types';

interface ChartData {
  week: string;
  mood: number | null;
  exercise: number | null;
  goalRate: number | null;
}

export function Dashboard() {
  const { t, settings } = useSettings();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [incompleteGoals, setIncompleteGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [checkIns, goals, progress] = await Promise.all([
      getCheckIns(),
      getGoals(),
      getGoalProgress(),
    ]);

    const weeks = getLastNWeeks(8);
    const currentWeek = getWeekStart();

    const data: ChartData[] = weeks.map((week) => {
      const checkIn = checkIns.find((c) => c.weekStart === week);
      const weekProgress = progress.filter((p) => p.weekStart === week);
      const completedCount = weekProgress.filter((p) => p.done).length;
      const totalGoals = goals.length;

      return {
        week: formatDate(week, settings.language).slice(5),
        mood: checkIn?.mood ?? null,
        exercise: checkIn?.exerciseCount ?? null,
        goalRate: totalGoals > 0 ? Math.round((completedCount / totalGoals) * 100) : null,
      };
    });
    setChartData(data);

    const currentProgress = progress.filter((p) => p.weekStart === currentWeek && p.done);
    const completedGoalIds = new Set(currentProgress.map((p) => p.goalId));
    const incomplete = goals.filter((g) => !completedGoalIds.has(g.id));
    setIncompleteGoals(incomplete);

    setLoading(false);
  }

  if (loading) {
    return <div className="loading">{t.common.loading}</div>;
  }

  return (
    <div className="dashboard">
      <h2>{t.dashboard.title}</h2>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>{t.dashboard.weeklyMood}</h3>
          <p className="chart-subtitle">{t.dashboard.last8Weeks}</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#8884d8" strokeWidth={2} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>{t.dashboard.weeklyExercise}</h3>
          <p className="chart-subtitle">{t.dashboard.last8Weeks}</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="exercise" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>{t.dashboard.goalProgress}</h3>
          <p className="chart-subtitle">{t.dashboard.last8Weeks}</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis domain={[0, 100]} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="goalRate" stroke="#ffc658" strokeWidth={2} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="incomplete-goals">
        <h3>{t.dashboard.incompleteGoals}</h3>
        {incompleteGoals.length === 0 ? (
          <p className="no-data">{t.dashboard.noIncomplete}</p>
        ) : (
          <ul className="goal-list">
            {incompleteGoals.map((goal) => (
              <li key={goal.id} className="goal-item">
                <span className="goal-title">{goal.title}</span>
                <span className="goal-category">{t.goals.categories[goal.category]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
