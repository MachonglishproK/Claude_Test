# Playfulness Backlog

## Executive Summary

This document outlines UX improvements to transform the Weekly Review Dashboard into a more engaging, low-pressure experience. The goal is **not flashiness** but reducing friction, confusion, and anxiety while adding subtle delight.

---

## Quick Wins (10+ items, Impact vs Cost matrix)

| # | Screen | Change | Impact | Cost | Priority |
|---|--------|--------|--------|------|----------|
| 1 | Dashboard | Add "Today's Mission" card at top | High | Low | P0 |
| 2 | Dashboard | Show companion greeting on load | High | Low | P0 |
| 3 | Dashboard | Add egg progress summary widget | Medium | Low | P0 |
| 4 | Dashboard | Single clear CTA "Next step" button | High | Low | P0 |
| 5 | MissionCard | Add "Not now" dismiss option | High | Low | P0 |
| 6 | MissionCard | Completion checkmark animation (300ms) | Medium | Low | P1 |
| 7 | CompanionWidget | Add personality-based greeting | High | Medium | P0 |
| 8 | Settings | Add "Support Style" selector | Medium | Medium | P0 |
| 9 | WeeklySummary | 3-line digest format | High | Medium | P1 |
| 10 | WeeklySummary | Companion reaction message | Medium | Low | P1 |
| 11 | All CTAs | Add "skip/later" micro-option | High | Low | P0 |
| 12 | Incubator | Egg progress tooltip "How to progress" | Medium | Low | P1 |
| 13 | Goal completion | Brief celebration (confetti-free) | Medium | Low | P1 |
| 14 | Navigation | Active state color uses companion color | Low | Low | P2 |

---

## User Flows Analysis

### Flow 1: Daily Visit (Most Common)
**Current**: Dashboard → Charts → Scroll to find actions
**Improved**: Dashboard → See companion + today's missions + egg progress immediately

### Flow 2: Weekly Check-in
**Current**: Navigate to Check-in → 5 steps → Submit
**Improved**: Dashboard CTA → Check-in → Companion supports each step

### Flow 3: Goal Tracking
**Current**: Goals page → Mark complete → Return to dashboard
**Improved**: Dashboard quick-check → Companion celebrates → Egg progress shown

### Flow 4: Mission Completion
**Current**: Find mission → Complete → See XP gained
**Improved**: Mission card → Complete → 300ms animation → Companion praise → Egg progress bump

### Flow 5: Egg Hatching
**Current**: Navigate to collection → Hatch → See result
**Improved**: Dashboard notification → One-tap hatch → Brief reveal → Collection or set as companion

### Flow 6: Return After Gap
**Current**: Same dashboard as always
**Improved**: Companion "Welcome back" → Return bonus egg → Low-pressure restart

### Flow 7: Weekly Summary Review
**Current**: Scroll through stats
**Improved**: 3-line digest → Companion reaction → Optional "make goals lighter"

---

## Microcopy Dictionary Specification

### 6 Intent Categories

| Intent | Use Case | Tone | Max Length |
|--------|----------|------|------------|
| Start | App open, new session | Welcoming, brief | 15 chars |
| Praise | Task/goal/mission complete | Encouraging, specific | 20 chars |
| Suggest | Proposing next action | Soft, optional | 25 chars |
| WelcomeBack | Return after 1+ days | Warm, no guilt | 20 chars |
| WeeklySummary | Weekly review complete | Reflective, forward | 30 chars |
| SoftFail | Incomplete/skipped | Understanding, restart-ok | 25 chars |

### Placeholder Tokens
- `{name}` - User's name (if set)
- `{streak}` - Current streak count
- `{mission}` - Mission name
- `{progress}` - Percentage complete
- `{level}` - Companion level

### Prohibited Patterns
- Guilt-inducing ("You haven't done X")
- Demanding ("You must", "You should")
- Long lectures (>30 chars)
- Excessive punctuation ("!!!")

---

## Support Styles

| Style | Japanese | English | Description |
|-------|----------|---------|-------------|
| praise | 褒め多め | Encouraging | More frequent praise, celebrates small wins |
| fact | 事実多め | Factual | Data-focused, minimal emotional language |
| empathy | 共感多め | Empathetic | Acknowledges feelings, validates struggles |
| minimal | さっぱり | Minimal | Brief, to-the-point, respects user's time |

---

## Cockpit Dashboard Layout (375px mobile-first)

```
┌─────────────────────────────┐
│  [Companion Card]           │  ← Greeting + XP bar + Level
│  "いっしょに、ひとつだけ"     │
├─────────────────────────────┤
│  [Today's Missions (2)]     │  ← Quick/Medium + Swap buttons
│  ☐ Mission 1    [Swap]      │
│  ☐ Mission 2    [Swap]      │
│  [今はしない]                │  ← Zero-pressure dismiss
├─────────────────────────────┤
│  [Egg Progress]             │  ← Compact, collapsible
│  🥚 45% ───────▓░░░░        │
│  [どう進める？] optional     │
├─────────────────────────────┤
│  [Next Action CTA]          │  ← Single primary button
│  ▶ 今週を記録する            │
│  [あとで]                    │
├─────────────────────────────┤
│  [This Week Goals] compact  │
│  [Charts] collapsed/toggle  │
└─────────────────────────────┘
```

---

## Animation Specifications

| Element | Duration | Easing | Trigger |
|---------|----------|--------|---------|
| Task complete checkmark | 300ms | ease-out | On complete |
| XP bar fill | 400ms | ease-in-out | XP gained |
| Egg progress bump | 200ms | ease-out | Progress added |
| Companion state change | 300ms | ease-in-out | State change |
| Card dismiss | 200ms | ease-out | Dismiss click |
| Level up glow | 500ms | ease-in-out | Level up |

All animations:
- Respect `prefers-reduced-motion`
- Can be disabled in settings
- No particles/confetti (lightweight)

---

## Data Model Extensions

```typescript
// New: Support Style in Settings
interface Settings {
  // ... existing
  supportStyle: 'praise' | 'fact' | 'empathy' | 'minimal';
}

// New: Intent mapping for screens
type ScreenIntent = {
  screen: string;
  intents: CopyIntent[];
};
```

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Focus management | Visible focus rings, logical tab order |
| ARIA labels | All interactive elements labeled |
| Touch targets | Minimum 44x44px |
| Contrast | WCAG AA minimum (4.5:1 text, 3:1 UI) |
| Motion | prefers-reduced-motion respected |
| Screen reader | Companion messages announced |

---

## Responsive Breakpoints

| Breakpoint | Layout Changes |
|------------|----------------|
| 375px | Single column, stacked cards |
| 768px | Two-column grid for missions, wider cards |
| 1280px | Three-column layout, sidebar navigation |

---

## Implementation Order

1. **Phase 1 (P0)**: Core Experience
   - Microcopy dictionary (companionCopy.ts)
   - Support style setting
   - Dashboard cockpit layout
   - Zero-pressure options

2. **Phase 2 (P1)**: Delight Layer
   - Micro-animations
   - Weekly summary 30-second format
   - Egg progress hints

3. **Phase 3 (P2)**: Polish
   - Companion color theming
   - Responsive refinements
   - Performance optimization

---

## Success Metrics (If Tracked)

| Metric | Target |
|--------|--------|
| Daily return rate | +15% |
| Mission completion rate | +20% |
| Weekly check-in completion | +10% |
| Settings: animations ON | >80% |
| Settings: collection OFF | <10% |

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/companionCopy.ts` | Create | Microcopy dictionary |
| `src/types/index.ts` | Modify | Add SupportStyle type |
| `src/lib/storage.ts` | Modify | Add supportStyle to settings |
| `src/pages/Dashboard.tsx` | Modify | Cockpit layout |
| `src/components/companion/CompanionWidget.tsx` | Modify | Use new copy system |
| `src/components/cockpit/CockpitCard.tsx` | Create | Reusable cockpit sections |
| `src/components/cockpit/NextActionCTA.tsx` | Create | Primary CTA component |
| `src/i18n/translations.ts` | Modify | Add new UI strings |
| `src/App.css` | Modify | Cockpit styles |
| `src/pages/Settings.tsx` | Modify | Support style selector |

---

*Document version: 1.0 | Created: 2026-02-05*
