# MINDSPRING product design audit

**Date:** 2026-10-24
**Scope:** Home → daily check-in → Insights → selected activity date
**Viewport checks:** 735 × 785 and 390 × 845
**Data:** Existing local preview profile and sample activity; no app data was changed.

## Findings

### P2 — The daily check-in action starts below the first mobile screen

At 390 px, Home shows the greeting, reflection prompt, and momentum card before the top of the Daily check-in card. Its controls and save action are below the fold, so the core daily ritual requires a scroll. Consider shortening the prompt/momentum area on small screens or placing a clear check-in action above it.

**Evidence:** [Home overview at 390 px](./07-home-overview-390px.png)

### P2 — Insights has no direct destination in the mobile navigation

The fixed mobile navigation contains Home, Goals, Add, Journal, and Profile. Insights is reachable through the Home momentum card, but that indirect path makes progress review harder to discover. Consider a Growth destination that groups Insights and Habits, or another visible route to Insights.

**Evidence:** [Insights overview at 390 px](./06-insights-overview-390px.png); [Home overview at 390 px](./07-home-overview-390px.png)

## Flow review

1. **Open Home and scan today's guidance — Mixed.** The greeting, berry prompt card, and ochre momentum card establish a clear hierarchy and retain feature color identities. The daily check-in controls begin below the first 390 px screen.
2. **Review the daily check-in — Good.** Mood, energy, and an optional note are grouped in one card. The save button has a visible keyboard focus state. At 735 px the form and focus actions are easy to scan; the controls require scrolling on a narrow screen.
3. **Review progress in Insights — Mixed.** Daily pauses and small actions are distinct, labeled summaries; the mood view and longer-range activity require vertical scrolling. The screen has no direct mobile-nav entry.
4. **Select a day in the activity map — Good.** The date control, legend, selected state, and detail summary communicate the saved check-in, habit, and reflection in text as well as color/symbols. The selected-day card provides useful context without requiring the user to infer it from the map.

## Supporting screenshots

- [Home overview at 735 px](./01-home-overview-735px.png)
- [Daily check-in at 735 px](./02-daily-check-in-735px.png)
- [Insights overview at 735 px](./03-insights-overview-735px.png)
- [30-day activity at 735 px](./04-30-day-activity-735px.png)
- [Selected-day details at 735 px](./05-selected-day-details-735px.png)
- [Insights overview at 390 px](./06-insights-overview-390px.png)
- [Home overview at 390 px](./07-home-overview-390px.png)

## Limits

The checked page widths showed no horizontal overflow. A keyboard Tab check confirmed a visible focus indicator on the check-in save button. This visual audit does not establish screen-reader behavior, full keyboard coverage, contrast compliance, browser zoom behavior, reduced-motion behavior, or cross-browser consistency.

## Implementation follow-up

- Added a state-aware **Start/Review today’s check-in** shortcut beneath the Home intention. It jumps directly to the form with space below the sticky header. The form itself remains in the Home flow, so some scrolling can still be needed to complete it.
- After saving, the check-in now keeps its confirmation visible and links to a relevant next step: an unfinished habit, a new habit, or a journal reflection. This also fixes the state-sync issue that cleared the success message immediately after saving.
- Added Insights to the fixed mobile navigation and reduced its mobile summary-card height so the mood overview appears sooner.
- Verified the check-in shortcut and Insights route in the browser at 390 px. Home and the mobile navigation also fit at 320 px with no horizontal overflow.
- Verification passed: `npm run test -- --run` (30 tests), `npm run typecheck`, and `npm run build`.

Updated screenshots: [Home flow at 390 px](./08-home-flow-improvements-390px.png) · [Insights at 390 px](./09-insights-flow-improvements-390px.png) · [Home at 320 px](./10-home-improvements-320px.png)
