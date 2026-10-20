# MINDSPRING Interactive Web MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive self-growth app that guides a person from a brief welcome through daily check-ins, habits, journaling, and progress review.

**Architecture:** Create a React single-page app with routed screens and shared local state. Save the profile and activity in browser storage; no server account or sync is included.

**Tech Stack:** React, TypeScript, Vite, React Router, CSS custom properties, Vitest, and React Testing Library.

**Spec:** Attached `Self-Growth App Landing UI.png` and the approved scope/color/stack choices in the implementation request.

## Global Constraints

- Support desktop and mobile layouts.
- Use browser-local storage; do not add server accounts, authentication, or cross-device sync.
- Use React + TypeScript.
- Replace the reference palette with distinct berry-family color coding.
- Pair color cues with text or icons; color alone must not convey meaning.

## Review Focus

- Empty first visit: show welcome and onboarding instead of a broken dashboard; cover in the onboarding tests.
- Missing or malformed saved data: start safely and show a recovery notice; cover in storage tests.
- Local date rollover: keep prior activity and assign new activity to the current local date; cover in check-in and habit tests.
- Small screens: keep navigation and forms usable without horizontal overflow; check manually at 390 × 844.
- Color meaning and contrast: preserve distinct feature identities and readable labels; check manually in the visual review.

## Implementation Changes

### File map

- App setup and shared state: `package.json`, `vite.config.ts`, `src/app/`
- Screens and shared UI: `src/features/`, `src/components/`
- Theme and responsive styles: `src/styles/tokens.css`, `src/styles/global.css`
- Behavior tests: `src/**/*.test.ts` and `src/**/*.test.tsx`

### Interfaces

- `Mood = "low" | "steady" | "bright"`.
- `AppData` contains `profile: { displayName: string; intention: string } | null`, `goals`, `habits`, `checkIns`, and `journalEntries`.
- A goal has an `id`, `title`, and completion status. A habit has an `id`, `title`, and `completedDates: string[]`. A daily check-in stores a local `dateKey`, mood, and energy from 1–5. A journal entry stores an `id`, `dateKey`, timestamp, and body.
- The app store exposes `completeOnboarding(profile)`, `saveCheckIn(input)`, `addGoal(title)`, `toggleGoal(id)`, `addHabit(title)`, `toggleHabitToday(id, dateKey)`, `addJournalEntry(body)`, and `clearData()`.
- Persist JSON under `mindspring:v1`. Use local `YYYY-MM-DD` date keys. Trim required text fields and reject blank submissions.
- Routes: `/` landing, `/welcome` onboarding, and `/app/home`, `/app/goals`, `/app/habits`, `/app/journal`, `/app/insights`, `/app/profile`. Redirect protected app routes to onboarding until a local profile exists.
- The home momentum ring is the percentage of today’s tracker completed: the check-in counts as one item, plus each active habit. Insights summarizes check-ins and completed habits over the past seven days.
- Color tokens: deep plum `#49273F` for brand and primary actions; berry `#9A3D6C` for Goals; dusty rose `#B96583` for Habits; lilac `#79618D` for Journal; golden ochre `#9B731A` for Insights; warm blush `#FBF7F8` for the page background. Use lighter tints for card fills and dark text for legibility.
- Desktop uses a top navigation and two-column dashboard where space permits. At widths below 768px, stack content and use bottom navigation for Home, Goals, Add, Journal, and Profile. Reach Habits from the home focus section and Insights from the home progress card.
- The screenshot’s callouts are treated as design annotations, not separate user instructions. Community features, notifications, deployment, and remote services are outside this MVP.

### Task 1: Scaffold, routes, and design system

**Files:** Create the Vite app, `src/app/router.tsx`, shared shell and navigation components, and theme CSS.
**Test:** `AppShell.test.tsx` verifies expected navigation links and route destinations.

- [ ] Write the failing shell navigation test.
- [ ] Run `npm run test -- --run src/components/AppShell.test.tsx`; confirm it fails before implementation.
- [ ] Scaffold the React + TypeScript app, routes, responsive shell, and berry color tokens.
- [ ] Run the test, typecheck, and build; commit the verified task.

### Task 2: State and browser persistence

**Files:** Create `src/app/model.ts`, `src/app/storage.ts`, `src/app/store.tsx`, and storage tests.

- [ ] Test empty storage, malformed JSON recovery, save-and-reload, and local date-key formatting.
- [ ] Run the focused tests and confirm they fail before implementation.
- [ ] Implement the declared `AppData` model, store actions, and `mindspring:v1` persistence.
- [ ] Show a notice if saved data cannot be read or browser storage is unavailable; verify tests and commit.

### Task 3: Landing and onboarding

**Files:** Create landing and onboarding screens and their tests.

- [ ] Test that the landing CTA opens onboarding, blank name or intention is rejected, and valid onboarding reaches Home.
- [ ] Run the focused tests and confirm they fail before implementation.
- [ ] Implement a short local-profile setup with a display name and one intention; do not request email or password.
- [ ] Verify the profile remains after reload; commit.

### Task 4: Home, check-in, and habits

**Files:** Create the home dashboard, check-in form, habit controls, and behavior tests.

- [ ] Test mood and energy saving, same-day check-in updates, habit completion toggling, and the momentum formula.
- [ ] Run the focused tests and confirm they fail before implementation.
- [ ] Implement the dashboard, labeled mood choices, 1–5 energy control, focus actions, and empty states.
- [ ] Verify today’s progress and persisted data; commit.

### Task 5: Goals, journal, insights, and profile

**Files:** Create the remaining feature screens and tests.

- [ ] Test goal creation/completion, journal entry creation, seven-day summaries, profile editing, and clear-data confirmation.
- [ ] Run the focused tests and confirm they fail before implementation.
- [ ] Implement those screens, accessible text summaries for progress visuals, and return to the welcome flow after data is cleared.
- [ ] Verify saved changes and commit.

### Task 6: Integrated review

- [ ] Run `npm run test -- --run`, `npm run typecheck`, and `npm run build`.
- [ ] Manually complete the full flow at desktop and 390 × 844 mobile sizes; check keyboard use, contrast, reduced-motion behavior, and overflow.
- [ ] Fix any findings and record the final verified state.
