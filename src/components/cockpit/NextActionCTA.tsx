import { Link } from 'react-router-dom';
import { PenSquare, Target, CheckCircle, ChevronRight } from 'lucide-react';

export type NextActionType = 'checkin' | 'goal' | 'mission' | 'none';

interface NextActionCTAProps {
  actionType: NextActionType;
  language: 'ja' | 'en';
  onDismiss?: () => void;
  showDismiss?: boolean;
}

const ACTION_CONFIG: Record<NextActionType, {
  icon: typeof PenSquare;
  labelJa: string;
  labelEn: string;
  descJa: string;
  descEn: string;
  to: string;
}> = {
  checkin: {
    icon: PenSquare,
    labelJa: '今週を記録する',
    labelEn: 'Record this week',
    descJa: '5分ほどで完了',
    descEn: 'About 5 minutes',
    to: '/checkin',
  },
  goal: {
    icon: Target,
    labelJa: '目標を追加',
    labelEn: 'Add a goal',
    descJa: '達成したいことを設定',
    descEn: 'Set something to achieve',
    to: '/goals',
  },
  mission: {
    icon: CheckCircle,
    labelJa: 'ミッションを始める',
    labelEn: 'Start a mission',
    descJa: '30秒からできる',
    descEn: 'From 30 seconds',
    to: '#missions',
  },
  none: {
    icon: CheckCircle,
    labelJa: '完了！',
    labelEn: 'All done!',
    descJa: 'またあとで',
    descEn: 'See you later',
    to: '',
  },
};

export function NextActionCTA({
  actionType,
  language,
  onDismiss,
  showDismiss = true,
}: NextActionCTAProps) {
  if (actionType === 'none') {
    return (
      <div className="next-action-cta next-action-done">
        <CheckCircle size={20} />
        <span>{language === 'ja' ? 'おつかれさま！' : 'Great job!'}</span>
      </div>
    );
  }

  const config = ACTION_CONFIG[actionType];
  const Icon = config.icon;

  const content = (
    <>
      <div className="next-action-content">
        <Icon size={20} />
        <div className="next-action-text">
          <span className="next-action-label">
            {language === 'ja' ? config.labelJa : config.labelEn}
          </span>
          <span className="next-action-desc">
            {language === 'ja' ? config.descJa : config.descEn}
          </span>
        </div>
      </div>
      <ChevronRight size={20} className="next-action-arrow" />
    </>
  );

  return (
    <div className="next-action-wrapper">
      {config.to.startsWith('#') ? (
        <a href={config.to} className="next-action-cta">
          {content}
        </a>
      ) : (
        <Link to={config.to} className="next-action-cta">
          {content}
        </Link>
      )}
      {showDismiss && onDismiss && (
        <button
          className="next-action-dismiss"
          onClick={onDismiss}
          aria-label={language === 'ja' ? '今はしない' : 'Not now'}
        >
          {language === 'ja' ? '今はしない' : 'Not now'}
        </button>
      )}
    </div>
  );
}
