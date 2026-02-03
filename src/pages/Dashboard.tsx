import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { PenSquare, Target, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { getCheckIns, getGoals, getGoalProgress, getUserStats, toggleGoalProgress, updateGoalCompletionStats } from '../lib/storage';
import { getLastNWeeks, getWeekStart, formatDate } from '../lib/date';
import { WeeklySummaryCard, BadgeDisplay, NewBadgeNotification } from '../components/gamification';
import type { Goal, UserStats, Badge, CheckIn } from '../types';

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
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [currentCheckIn, setCurrentCheckIn] = useState<CheckIn | null>(null);
  const [previousCheckIn, setPreviousCheckIn] = useState<CheckIn | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [goalsCompletedThisWeek, setGoalsCompletedThisWeek] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentWeek = getWeekStart();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [checkIns, goals, progress, stats] = await Promise.all([
      getCheckIns(),
      getGoals(),
      getGoalProgress(),
      getUserStats(),
    ]);

    const weeks = getLastNWeeks(8);

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
    setAllGoals(goals);
    setGoalsCompletedThisWeek(currentProgress.length);

    // Get current and previous check-in for mood comparison
    const sortedCheckIns = [...checkIns].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
    const current = sortedCheckIns.find(c => c.weekStart === currentWeek) || null;
    const previous = sortedCheckIns.find(c => c.weekStart !== currentWeek) || null;
    setCurrentCheckIn(current);
    setPreviousCheckIn(previous);

    setUserStats(stats);
    setLoading(false);
  }

  async function handleQuickToggleGoal(goalId: string) {
    await toggleGoalProgress(goalId, currentWeek);
    const badges = await updateGoalCompletionStats();
    if (badges.length > 0) {
      setNewBadges(badges);
    }
    await loadData();
  }

  function dismissBadgeNotification() {
    setNewBadges([]);
  }

  if (loading) {
    return <div className="loading">{t.common.loading}</div>;
  }

  const gamificationEnabled = settings.gamificationEnabled;

  return (
    <div className="dashboard">
      <h2>{t.dashboard.title}</h2>

      {/* Badge Notification */}
      {gamificationEnabled && newBadges.length > 0 && (
        <NewBadgeNotification
          badges={newBadges}
          language={settings.language}
          onDismiss={dismissBadgeNotification}
          title={t.gamification.badges.newBadge}
        />
      )}

      {/* Weekly Summary Card - Gamification */}
      {gamificationEnabled && userStats && (
        <WeeklySummaryCard
          goalsCompleted={goalsCompletedThisWeek}
          totalGoals={allGoals.length}
          mood={currentCheckIn?.mood ?? null}
          previousMood={previousCheckIn?.mood ?? null}
          streakDays={userStats.currentStreak}
          longestStreak={userStats.longestStreak}
          translations={{
            title: t.gamification.weeklySummary.title,
            goalsProgress: t.gamification.weeklySummary.goalsProgress,
            moodTrend: t.gamification.weeklySummary.moodTrend,
            streak: t.gamification.weeklySummary.streak,
            streakLabel: t.gamification.weeklySummary.streakLabel,
            encouragements: t.gamification.weeklySummary.encouragements,
            moodLabels: [...t.checkin.moodLabels],
          }}
        />
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        {!currentCheckIn && (
          <Link to="/checkin" className="quick-action-btn">
            <PenSquare size={16} />
            {t.dashboard.quickCheckin}
          </Link>
        )}
        {allGoals.length === 0 && (
          <Link to="/goals" className="quick-action-btn secondary">
            <Target size={16} />
            {t.dashboard.emptyState.addGoal}
          </Link>
        )}
      </div>

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
                <button
                  className="goal-quick-check"
                  onClick={() => handleQuickToggleGoal(goal.id)}
                  aria-label={`Mark ${goal.title} as complete`}
                >
                  <CheckCircle2 size={20} />
                </button>
                <span className="goal-title">{goal.title}</span>
                <span className="goal-category">{t.goals.categories[goal.category]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Badges Section - Gamification */}
      {gamificationEnabled && userStats && userStats.badges.length > 0 && (
        <div className="dashboard-badges">
          <BadgeDisplay
            badges={userStats.badges}
            language={settings.language}
            title={t.gamification.badges.title}
            showEmpty={false}
            maxDisplay={6}
          />
        </div>
      )}
    </div>
  );
}
