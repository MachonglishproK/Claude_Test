import { Award } from 'lucide-react';
import type { Badge } from '../../types';
import { getBadgeInfo } from '../../lib/storage';

interface BadgeDisplayProps {
  badges: Badge[];
  language: 'ja' | 'en';
  title?: string;
  showEmpty?: boolean;
  emptyMessage?: string;
  maxDisplay?: number;
}

export function BadgeDisplay({
  badges,
  language,
  title,
  showEmpty = true,
  emptyMessage,
  maxDisplay,
}: BadgeDisplayProps) {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const hasMore = maxDisplay && badges.length > maxDisplay;

  if (badges.length === 0 && !showEmpty) {
    return null;
  }

  return (
    <div className="badge-display">
      {title && <h4 className="badge-title">{title}</h4>}
      {badges.length === 0 ? (
        <p className="badge-empty">{emptyMessage}</p>
      ) : (
        <div className="badge-grid">
          {displayBadges.map((badge) => (
            <BadgeItem key={badge.id} badge={badge} language={language} />
          ))}
          {hasMore && (
            <div className="badge-more">+{badges.length - maxDisplay!}</div>
          )}
        </div>
      )}
    </div>
  );
}

interface BadgeItemProps {
  badge: Badge;
  language: 'ja' | 'en';
  size?: 'sm' | 'md' | 'lg';
}

export function BadgeItem({ badge, language, size = 'md' }: BadgeItemProps) {
  const info = getBadgeInfo(badge.type);
  const isNew = !badge.seen;

  return (
    <div className={`badge-item ${size} ${isNew ? 'new' : ''}`} title={info.description[language]}>
      <span className="badge-icon">{info.icon}</span>
      <span className="badge-name">{info.name[language]}</span>
      {isNew && <span className="badge-new-indicator" />}
    </div>
  );
}

interface NewBadgeNotificationProps {
  badges: Badge[];
  language: 'ja' | 'en';
  onDismiss: () => void;
  title: string;
}

export function NewBadgeNotification({
  badges,
  language,
  onDismiss,
  title,
}: NewBadgeNotificationProps) {
  if (badges.length === 0) return null;

  return (
    <div className="badge-notification">
      <div className="badge-notification-content">
        <Award size={24} className="badge-notification-icon" />
        <div className="badge-notification-text">
          <strong>{title}</strong>
          <div className="badge-notification-list">
            {badges.map((badge) => {
              const info = getBadgeInfo(badge.type);
              return (
                <span key={badge.id} className="badge-notification-item">
                  {info.icon} {info.name[language]}
                </span>
              );
            })}
          </div>
        </div>
        <button className="badge-notification-dismiss" onClick={onDismiss}>
          &times;
        </button>
      </div>
    </div>
  );
}
