/**
 * Companion Microcopy Dictionary
 *
 * 6 Intent Categories × 8 Companions × 4 Support Styles
 * All text is designed to be:
 * - Short (max 30 chars for Japanese)
 * - Zero-pressure (no guilt, no demands)
 * - Optionality-preserving (always allows "not now")
 */

import type { CompanionId } from '../types';

// ===================================
// Types
// ===================================

export type CopyIntent =
  | 'start'           // App open, new session
  | 'praise'          // Task/goal/mission complete
  | 'suggest'         // Proposing next action
  | 'welcomeBack'     // Return after 1+ days
  | 'weeklySummary'   // Weekly review complete
  | 'softFail';       // Incomplete/skipped, restart-ok

export type SupportStyle =
  | 'praise'    // 褒め多め - More frequent praise
  | 'fact'      // 事実多め - Data-focused
  | 'empathy'   // 共感多め - Validates feelings
  | 'minimal';  // さっぱり - Brief, to-the-point

export interface CopyTemplate {
  ja: string;
  en: string;
}

export interface CompanionCopySet {
  start: CopyTemplate;
  praise: CopyTemplate;
  suggest: CopyTemplate;
  welcomeBack: CopyTemplate;
  weeklySummary: CopyTemplate;
  softFail: CopyTemplate;
}

// Placeholder tokens
// {name} - User's name (if set)
// {streak} - Current streak count
// {mission} - Mission name
// {progress} - Percentage complete
// {level} - Companion level

// ===================================
// Base Copy Dictionary (Default Style)
// ===================================

export const COMPANION_COPY: Record<CompanionId, CompanionCopySet> = {
  kotsuri: {
    start: {
      ja: 'おはよう。今日もぼちぼち',
      en: 'Morning. Let\'s take it easy',
    },
    praise: {
      ja: 'できたね。えらい',
      en: 'You did it. Well done',
    },
    suggest: {
      ja: '次はこれ、どうかな',
      en: 'How about this next?',
    },
    welcomeBack: {
      ja: 'おかえり。待ってたよ',
      en: 'Welcome back. Missed you',
    },
    weeklySummary: {
      ja: '今週もがんばったね',
      en: 'Good effort this week',
    },
    softFail: {
      ja: 'また明日でいいよ',
      en: 'Tomorrow works too',
    },
  },

  torai: {
    start: {
      ja: 'よし、今日も挑戦！',
      en: 'Alright, let\'s try!',
    },
    praise: {
      ja: 'やるじゃん！',
      en: 'Nice one!',
    },
    suggest: {
      ja: 'これ、いけそう？',
      en: 'Think you can try this?',
    },
    welcomeBack: {
      ja: '待ってた！またやろう',
      en: 'Been waiting! Let\'s go',
    },
    weeklySummary: {
      ja: '今週よくがんばった！',
      en: 'Great effort this week!',
    },
    softFail: {
      ja: '次こそ！',
      en: 'Next time!',
    },
  },

  nonbi: {
    start: {
      ja: 'のんびりいこう',
      en: 'Let\'s take it slow',
    },
    praise: {
      ja: 'いいペースだね',
      en: 'Nice pace',
    },
    suggest: {
      ja: 'むりしなくていいよ',
      en: 'No need to push',
    },
    welcomeBack: {
      ja: 'おかえりー',
      en: 'Welcome back~',
    },
    weeklySummary: {
      ja: 'ゆっくりできた？',
      en: 'Did you rest well?',
    },
    softFail: {
      ja: '休むのも大事だよ',
      en: 'Rest is important too',
    },
  },

  kiri: {
    start: {
      ja: '今日のタスク確認',
      en: 'Today\'s tasks ready',
    },
    praise: {
      ja: '完了',
      en: 'Done',
    },
    suggest: {
      ja: '次はこれ',
      en: 'Next is this',
    },
    welcomeBack: {
      ja: '再開しよう',
      en: 'Let\'s continue',
    },
    weeklySummary: {
      ja: '整理できた週だった',
      en: 'A well-organized week',
    },
    softFail: {
      ja: 'リセット。次へ',
      en: 'Reset. Moving on',
    },
  },

  haruka: {
    start: {
      ja: '今日の調子はどう？',
      en: 'How are you feeling?',
    },
    praise: {
      ja: 'うれしそう！',
      en: 'You look happy!',
    },
    suggest: {
      ja: '気が向いたらでいいよ',
      en: 'Whenever you feel like it',
    },
    welcomeBack: {
      ja: '会いたかったよ',
      en: 'I missed you',
    },
    weeklySummary: {
      ja: 'いろんな気持ちがあったね',
      en: 'Many feelings this week',
    },
    softFail: {
      ja: 'そういう日もあるよ',
      en: 'Some days are like that',
    },
  },

  mitemi: {
    start: {
      ja: '今週の進捗を確認',
      en: 'Checking this week\'s progress',
    },
    praise: {
      ja: '進捗あり！',
      en: 'Progress made!',
    },
    suggest: {
      ja: 'データ見てみる？',
      en: 'Want to see the data?',
    },
    welcomeBack: {
      ja: '記録を更新しよう',
      en: 'Let\'s update records',
    },
    weeklySummary: {
      ja: '可視化できたね',
      en: 'Nicely visualized',
    },
    softFail: {
      ja: '次の記録に期待',
      en: 'Looking forward to next time',
    },
  },

  nikoru: {
    start: {
      ja: 'やっほー！',
      en: 'Hey there!',
    },
    praise: {
      ja: 'すごーい！！',
      en: 'Amazing!!',
    },
    suggest: {
      ja: 'これ楽しそう！',
      en: 'This looks fun!',
    },
    welcomeBack: {
      ja: 'うれしい！また会えた',
      en: 'So happy to see you!',
    },
    weeklySummary: {
      ja: '今週もすばらしい！',
      en: 'Wonderful week!',
    },
    softFail: {
      ja: 'また遊ぼう！',
      en: 'Let\'s try again!',
    },
  },

  shibu: {
    start: {
      ja: '...',
      en: '...',
    },
    praise: {
      ja: '悪くない',
      en: 'Not bad',
    },
    suggest: {
      ja: 'やるなら、これ',
      en: 'If you want, this',
    },
    welcomeBack: {
      ja: '...戻ったか',
      en: '...You\'re back',
    },
    weeklySummary: {
      ja: 'よくやった',
      en: 'Well done',
    },
    softFail: {
      ja: '...また来い',
      en: '...Come back later',
    },
  },
};

// ===================================
// Style Variations (Modifiers)
// ===================================

/**
 * Get copy with support style applied
 * Style modifies the base copy for certain intents
 */
export function getStyledCopy(
  companionId: CompanionId,
  intent: CopyIntent,
  style: SupportStyle,
  language: 'ja' | 'en'
): string {
  const baseCopy = COMPANION_COPY[companionId][intent][language];

  // For most intents, return base copy
  // Style only affects certain situations
  if (style === 'minimal') {
    // Return shorter version where possible
    return getMinimalVersion(baseCopy, language);
  }

  if (style === 'praise' && intent === 'praise') {
    // Add extra encouragement
    return getPraiseEnhanced(baseCopy, companionId, language);
  }

  if (style === 'empathy' && intent === 'softFail') {
    // More understanding tone
    return getEmpathyEnhanced(baseCopy, companionId, language);
  }

  if (style === 'fact' && (intent === 'weeklySummary' || intent === 'suggest')) {
    // More data-focused
    return getFactEnhanced(baseCopy, language);
  }

  return baseCopy;
}

function getMinimalVersion(text: string, language: 'ja' | 'en'): string {
  // Shorten text by removing particles/softeners
  if (language === 'ja') {
    return text
      .replace(/だね$/, '')
      .replace(/よ$/, '')
      .replace(/ね$/, '')
      .replace(/！+/g, '')
      .trim();
  }
  return text.replace(/!+/g, '').replace(/~$/,'').trim();
}

function getPraiseEnhanced(text: string, companionId: CompanionId, language: 'ja' | 'en'): string {
  const suffixes: Record<string, { ja: string; en: string }> = {
    kotsuri: { ja: ' 🌟', en: ' 🌟' },
    torai: { ja: '！最高！', en: ' Awesome!' },
    nonbi: { ja: ' ふふ', en: ' hehe' },
    kiri: { ja: ' ✓', en: ' ✓' },
    haruka: { ja: ' 💫', en: ' 💫' },
    mitemi: { ja: ' (+1)', en: ' (+1)' },
    nikoru: { ja: '！！！', en: '!!!' },
    shibu: { ja: '', en: '' },
  };
  return text + (suffixes[companionId]?.[language] ?? '');
}

function getEmpathyEnhanced(text: string, companionId: CompanionId, language: 'ja' | 'en'): string {
  // Add understanding prefix for empathy style
  if (companionId === 'haruka' || companionId === 'nonbi') {
    return text; // Already empathetic
  }
  const prefix = language === 'ja' ? 'わかるよ。' : 'I understand. ';
  return prefix + text;
}

function getFactEnhanced(text: string, language: 'ja' | 'en'): string {
  // Keep it factual, remove emotional language
  if (language === 'ja') {
    return text
      .replace(/！/g, '。')
      .replace(/ね$/, '')
      .replace(/よ$/, '');
  }
  return text.replace(/!/g, '.').replace(/~$/,'');
}

// ===================================
// Screen-Intent Mapping
// ===================================

export type ScreenName =
  | 'dashboard'
  | 'checkin'
  | 'goals'
  | 'settings'
  | 'collection';

export const SCREEN_INTENT_MAP: Record<ScreenName, CopyIntent[]> = {
  dashboard: ['start', 'suggest', 'welcomeBack'],
  checkin: ['suggest', 'praise', 'softFail'],
  goals: ['praise', 'suggest', 'softFail'],
  settings: ['start'],
  collection: ['praise', 'suggest'],
};

/**
 * Get appropriate copy for a screen context
 */
export function getScreenCopy(
  screen: ScreenName,
  context: {
    isReturningUser: boolean;
    hasCompletedToday: boolean;
    lastVisitDaysAgo: number;
  },
  companionId: CompanionId,
  style: SupportStyle,
  language: 'ja' | 'en'
): string {
  let intent: CopyIntent = 'start';

  if (context.lastVisitDaysAgo >= 1) {
    intent = 'welcomeBack';
  } else if (context.hasCompletedToday) {
    intent = 'praise';
  } else if (screen === 'dashboard') {
    intent = 'suggest';
  }

  return getStyledCopy(companionId, intent, style, language);
}

// ===================================
// Placeholder Replacement
// ===================================

export interface CopyPlaceholders {
  name?: string;
  streak?: number;
  mission?: string;
  progress?: number;
  level?: number;
}

export function replacePlaceholders(
  text: string,
  placeholders: CopyPlaceholders
): string {
  let result = text;

  if (placeholders.name) {
    result = result.replace('{name}', placeholders.name);
  }
  if (placeholders.streak !== undefined) {
    result = result.replace('{streak}', String(placeholders.streak));
  }
  if (placeholders.mission) {
    result = result.replace('{mission}', placeholders.mission);
  }
  if (placeholders.progress !== undefined) {
    result = result.replace('{progress}', String(placeholders.progress));
  }
  if (placeholders.level !== undefined) {
    result = result.replace('{level}', String(placeholders.level));
  }

  return result;
}

// ===================================
// Quick Access Helpers
// ===================================

/**
 * Get companion greeting for dashboard
 */
export function getDashboardGreeting(
  companionId: CompanionId,
  style: SupportStyle,
  language: 'ja' | 'en',
  daysAway: number = 0
): string {
  const intent: CopyIntent = daysAway >= 1 ? 'welcomeBack' : 'start';
  return getStyledCopy(companionId, intent, style, language);
}

/**
 * Get completion message
 */
export function getCompletionMessage(
  companionId: CompanionId,
  style: SupportStyle,
  language: 'ja' | 'en'
): string {
  return getStyledCopy(companionId, 'praise', style, language);
}

/**
 * Get suggestion message
 */
export function getSuggestionMessage(
  companionId: CompanionId,
  style: SupportStyle,
  language: 'ja' | 'en'
): string {
  return getStyledCopy(companionId, 'suggest', style, language);
}

/**
 * Get soft fail / skip message
 */
export function getSkipMessage(
  companionId: CompanionId,
  style: SupportStyle,
  language: 'ja' | 'en'
): string {
  return getStyledCopy(companionId, 'softFail', style, language);
}

/**
 * Get weekly summary message
 */
export function getWeeklySummaryMessage(
  companionId: CompanionId,
  style: SupportStyle,
  language: 'ja' | 'en'
): string {
  return getStyledCopy(companionId, 'weeklySummary', style, language);
}

// ===================================
// Support Style Labels
// ===================================

export const SUPPORT_STYLE_LABELS: Record<SupportStyle, { ja: string; en: string; description: { ja: string; en: string } }> = {
  praise: {
    ja: '褒め多め',
    en: 'Encouraging',
    description: {
      ja: '小さな達成も積極的に褒める',
      en: 'Celebrates small wins frequently',
    },
  },
  fact: {
    ja: '事実多め',
    en: 'Factual',
    description: {
      ja: 'データや進捗を中心に伝える',
      en: 'Focuses on data and progress',
    },
  },
  empathy: {
    ja: '共感多め',
    en: 'Empathetic',
    description: {
      ja: '気持ちに寄り添い、理解を示す',
      en: 'Validates feelings and struggles',
    },
  },
  minimal: {
    ja: 'さっぱり',
    en: 'Minimal',
    description: {
      ja: '短く、要点だけ',
      en: 'Brief and to the point',
    },
  },
};
