# MINDSPRING iOS Mobile App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a native-feeling iPhone app for MINDSPRING’s existing self-growth flows while keeping the current web app available.

**Architecture:** Keep the Vite web app at the repository root and add a separate Expo React Native app in `apps/ios`. Extract the small pure domain layer into `packages/mindspring-core` so both apps use the same data model, local-date rules, progress calculations, and theme definitions; keep browser and iOS persistence adapters separate. Use Expo Router native tabs and a navigation stack for the iPhone interface.

**Tech Stack:** Expo SDK 58, React Native 0.88, React 19.3, TypeScript, Expo Router native tabs, AsyncStorage, Jest with `jest-expo`, and React Native Testing Library. Align Expo packages with the selected SDK using `npx expo install`.

**Spec:** Current app behavior in `src/app/model.ts`, `src/app/store.tsx`, `src/app/theme.ts`, `src/app/router.tsx`, and `src/features/`; approved web scope in `docs/superpowers/plans/2026-10-20-mindspring-web-mvp.md`; original MINDSPRING UI reference supplied in the conversation.

## Global Constraints

- Add an iOS app in `apps/ios`; do not replace or remove the existing web app.
- Target iOS 16.4 and later, the minimum supported by the selected Expo SDK 58 baseline. Revisit this only if older iPhone support is required.
- Use native iOS navigation and controls where they fit; do not render the website inside a WebView.
- Use the supplied MINDSPRING screen as visual reference; treat its margin notes and callouts as design annotations, not separate feature requests.
- Keep MINDSPRING account-free and offline-first. Store app data on the iPhone; do not add a server, login, notifications, analytics, or cross-device sync.
- Keep the current `AppData` behavior: profile and intention, goals, dated habit completions, daily mood/energy/optional note, and dated journal entries.
- Preserve the named Berry, Coastal, and Grove themes and distinct Goals, Habits, Journal, and Insights identities. Pair color with a label or symbol.
- Support system light/dark appearance, Dynamic Type, VoiceOver labels, safe areas, keyboard avoidance, and reduced motion.
- Use AsyncStorage for the MVP data document. It is persistent local key-value storage and is not encrypted by the app; state this in the app’s privacy copy and do not imply secure journaling or cloud backup.
- This Windows environment has Node 24 but no `xcodebuild`. Run source, test, and iOS bundle checks locally; simulator/device installation requires an available iPhone or an iOS build environment. EAS cloud iOS builds can be configured separately when Expo/Apple signing access is available; do not submit to the App Store as part of this plan.

## Review Focus

- First launch with no profile: complete welcome and onboarding before showing Today; cover with onboarding and route tests.
- Missing, malformed, or unreadable AsyncStorage data: start with empty state, keep the app usable, and show a recovery notice; cover in storage tests.
- Local midnight and foreground resume: preserve previous dated activity and assign new activity to today’s local date; cover in date and tracker tests.
- Long journal text, large Dynamic Type, and the keyboard: keep the active field and save action reachable on a short iPhone; cover with compose-screen tests and device review.
- Theme plus system appearance: keep feature labels readable and color meanings distinct in all three themes in light and dark mode; cover token checks and visual review.

## Product and Navigation

- First launch: a brief welcome and onboarding for display name and one intention. No email or password.
- Five stable native tabs: **Today**, **Goals**, **Journal**, **Insights**, and **Profile**.
- **Habits** opens as a stack destination from Today’s focus section and from the Add sheet. Profile remains available as a tab.
- A toolbar **Add** action presents a sheet for adding a goal, habit, or journal entry. Dismissal preserves an in-progress journal draft until the user discards it.
- Today retains the daily prompt, momentum, check-in, focus habits, gentle guidance, and growth links. A saved check-in offers a contextual next action.
- Insights retains seven-day summaries and the selectable 30-day activity map with readable day details.
- Clearing local data requires confirmation, clears the selected theme, and returns to welcome.
- Native app data is separate from the web browser’s `localStorage`; this MVP does not import or sync browser data.

## File Map

- `package.json`, `package-lock.json`: define npm workspaces for the existing web app, `apps/ios`, and `packages/mindspring-core`; add root scripts for native start, typecheck, and tests without changing the web commands.
- Root scripts: `ios:start`, `test:ios`, and `typecheck:ios`; keep `dev`, `test`, `typecheck`, and `build` for the web app.
- `packages/mindspring-core/package.json`, `packages/mindspring-core/src/index.ts`: export shared contracts and pure functions as `@mindspring/core`.
- `packages/mindspring-core/src/model.ts`: `Mood`, `Profile`, `Goal`, `Habit`, `DailyCheckIn`, `JournalEntry`, `AppData`, and empty-data factory.
- `packages/mindspring-core/src/dates.ts`: local `YYYY-MM-DD` keys, recent date ranges, and date labels.
- `packages/mindspring-core/src/progress.ts`: today momentum, seven-day summaries, and 30-day day details.
- `packages/mindspring-core/src/prompts.ts`: shared daily prompt rotation and weekly reflection prompt.
- `packages/mindspring-core/src/validation.ts`: `isAppData(value: unknown): value is AppData` and validation for calendar-valid local date keys.
- `packages/mindspring-core/src/themes.ts`: Berry/Coastal/Grove semantic color tokens for light and dark appearance.
- `src/app/model.ts`, `src/app/storage.ts`, `src/app/theme.ts`, `src/app/prompts.ts`, `src/features/insights/InsightsPage.tsx`: retain web import paths as re-exports/adapters and use the shared core; web behavior remains covered by existing tests.
- `apps/ios/package.json`, `apps/ios/app.json`, `apps/ios/eas.json`, `apps/ios/tsconfig.json`, `apps/ios/metro.config.js`: Expo app identity, scripts, workspace resolution, and build profiles; do not include credentials.
- `apps/ios/app/_layout.tsx`, `apps/ios/app/index.tsx`, `apps/ios/app/welcome.tsx`, `apps/ios/app/(tabs)/_layout.tsx`: hydration gate, entry routing, and native tab shell.
- `apps/ios/app/(tabs)/index.tsx`, `goals.tsx`, `journal.tsx`, `insights.tsx`, `profile.tsx`, `apps/ios/app/habits/index.tsx`, `apps/ios/app/add.tsx`, `apps/ios/app/journal/compose.tsx`: native screens and sheet/stack destinations.
- `apps/ios/src/state/AppProvider.tsx`: asynchronous app state and actions matching the web store semantics.
- `apps/ios/src/state/useLocalToday.ts`: local-day refresh at midnight and when the app returns to the foreground.
- `apps/ios/src/storage/nativeStorage.ts`: validated AsyncStorage load/save/clear adapter for keys `mindspring:v1` and `mindspring:theme`.
- `apps/ios/src/components/AddSheet.tsx`, `apps/ios/src/components/ThemePicker.tsx`, and `apps/ios/src/theme/ThemeProvider.tsx`: shared native add flow and theme resolution.
- `apps/ios/src/features/home/HomeScreen.tsx`, `CheckInCard.tsx`, `apps/ios/src/features/habits/HabitsScreen.tsx`, `apps/ios/src/features/goals/GoalsScreen.tsx`, `apps/ios/src/features/journal/JournalScreen.tsx`, `JournalComposer.tsx`, `apps/ios/src/features/insights/InsightsScreen.tsx`, and `apps/ios/src/features/profile/ProfileScreen.tsx`: focused feature views.
- `apps/ios/src/**/*.test.ts` and `apps/ios/src/**/*.test.tsx`: storage, state, navigation, and screen behavior tests.

## Interfaces

- Shared `AppData` and feature types keep the existing web shape.
- Shared validator export: `isAppData(value: unknown): value is AppData`; reject invalid calendar dates such as February 30.
- Shared date/progress exports: `getLocalDateKey(date?: Date): string`, `getRecentDateKeys(count: number, today?: Date): string[]`, `getTodayProgress(data: AppData, dateKey: string): TodayProgress`, `summarizeLastSevenDays(data: AppData, today?: Date): WeeklySummary`, and `summarizeLastThirtyDays(data: AppData, today?: Date): ActivityDay[]`.
- `WeeklyDay` contains `dateKey: string`, `checkIn: boolean`, `habitCompletions: number`, `mood: Mood | null`, and `energy: number | null`; `WeeklySummary` contains `days: WeeklyDay[]`, `checkInDays: number`, `habitCompletions: number`, `moodCounts: Record<Mood, number>`, and `averageEnergy: number | null`; `ActivityDay` contains `dateKey: string`, `checkIn: DailyCheckIn | null`, `habitCompletions: number`, and `reflections: number`.
- Native storage exports `loadAppData(): Promise<{ data: AppData; notice: string | null; available: boolean }>`, `saveAppData(data: AppData): Promise<boolean>`, and `clearAppData(): Promise<boolean>`; parsing reuses the shared validator and storage key `mindspring:v1`.
- `AppProvider` exposes `data`, `theme`, `status: 'loading' | 'ready'`, `storageAvailable`, `notice`, and async actions matching the web store semantics: `completeOnboarding(profile): Promise<boolean>`, `saveCheckIn(input): Promise<void>`, `addGoal(title): Promise<boolean>`, `toggleGoal(id): Promise<void>`, `addHabit(title): Promise<boolean>`, `toggleHabitToday(id, dateKey): Promise<void>`, `addJournalEntry(body, prompt?): Promise<boolean>`, `updateProfile(profile): Promise<boolean>`, `setTheme(theme): Promise<void>`, `dismissNotice(): void`, and `clearData(): Promise<void>`.

## Tasks

### Task 1: Shared core and Expo project shell

**Files:** Create `packages/mindspring-core/**`, Expo configuration, root layout, and static tab shell in `apps/ios/**`; modify root `package.json` and lockfile; adapt `src/app/model.ts`, `src/app/theme.ts`, and Insights imports.

- [ ] Write failing tests named `formatsLocalDateKeys`, `buildsRecentDatesAcrossMonthAndYearBoundaries`, `rejectsImpossibleDateKeys`, `calculatesMomentumFromCheckInAndHabits`, `summarizesSevenAndThirtyDayActivity`, and `providesThreeThemesForBothAppearances`; assert local `YYYY-MM-DD` output, chronological date keys, rejection of February 30, the completed/total/percentage tuple, check-in/habit/reflection counts, and distinct semantic tokens for Berry/Coastal/Grove light/dark themes.
- [ ] Run `npm run test -- --run packages/mindspring-core`; confirm the new core tests fail before implementation.
- [ ] Create the shared core and re-export it from the web’s existing import paths.
- [ ] Scaffold Expo SDK 58 with TypeScript and Expo Router native tabs; define five labeled tabs and the Habits stack route.
- [ ] Run `npm run test -- --run` and `npm run typecheck`; confirm existing web tests and new shared tests pass.
- [ ] Run `npx expo-doctor` from `apps/ios`; resolve dependency and workspace warnings.

### Task 2: Native persistence, onboarding, and theme shell

**Files:** Create `apps/ios/src/storage/nativeStorage.ts`, `apps/ios/src/state/AppProvider.tsx`, `apps/ios/app/index.tsx`, `apps/ios/app/welcome.tsx`, and `apps/ios/src/theme/**`; update the root route layout to gate on hydration.

- [ ] Write failing tests named `loadsEmptyData`, `recoversFromMalformedJson`, `roundTripsAppData`, `showsNoticeOnStorageFailure`, `waitsForHydrationBeforeRouting`, `rejectsBlankOnboarding`, and `clearsDataAndTheme`; assert safe empty state, notice text, persisted profile/activity/theme, and welcome routing.
- [ ] Run `npm run test:ios -- --runInBand apps/ios/src/storage/nativeStorage.test.ts apps/ios/src/state/AppProvider.test.tsx`; confirm failures before implementation.
- [ ] Implement validated AsyncStorage persistence, visible recovery/write notices, profile route gating, and the native state actions.
- [ ] Add three theme token sets with system light/dark variants and labels that do not rely on color alone.
- [ ] Run the focused tests and verify a profile and selected theme survive an app restart in the test harness.

### Task 3: Today, check-in, habits, and Add sheet

**Files:** Create Today, check-in, and Habits screens under `apps/ios/app/` and feature components/tests under `apps/ios/src/features/home/` and `apps/ios/src/features/habits/`.

- [ ] Write failing tests named `savesCheckInAndReplacesSameDayEntry`, `updatesMomentumAfterHabitToggle`, `showsContextualNextAction`, and `refreshesDateOnForeground`; assert saved values, a single same-day entry, updated progress, correct route, and current local date.
- [ ] Run `npm run test:ios -- --runInBand apps/ios/src/features/home/HomeScreen.test.tsx apps/ios/src/features/habits/HabitsScreen.test.tsx`; confirm failures before implementation.
- [ ] Build Today with the daily prompt, momentum summary, check-in form, focus habits, and direct habit navigation using safe-area-aware scrolling.
- [ ] Build the Habits screen and Add sheet with labeled native controls, blank-input validation, pending/success/error states, and draft-preserving dismissal.
- [ ] Verify tracker state after route changes and simulated local-date rollover.

### Task 4: Goals, Journal, Insights, and Profile

**Files:** Create `apps/ios/app/(tabs)/goals.tsx`, `journal.tsx`, `insights.tsx`, `profile.tsx`, `apps/ios/app/journal/compose.tsx`, and their feature components/tests.

- [ ] Write failing tests named `createsAndCompletesGoal`, `createsJournalEntryAndRejectsBlankText`, `keepsSaveAvailableForLongJournalDrafts`, `showsSelectedActivityDetails`, `persistsThemeAndProfile`, and `requiresConfirmationBeforeClear`; assert persisted content, reachable save action, shared summary values, selected-day text, selected appearance, and non-destructive cancel behavior.
- [ ] Run `npm run test:ios -- --runInBand apps/ios/src/features/goals/GoalsScreen.test.tsx apps/ios/src/features/journal/JournalScreen.test.tsx apps/ios/src/features/insights/InsightsScreen.test.tsx apps/ios/src/features/profile/ProfileScreen.test.tsx`; confirm failures before implementation.
- [ ] Implement native feature screens using shared data/progress contracts and the selected theme tokens.
- [ ] Provide accessible text summaries for activity visuals, selected-day details, and explicit labels for all chart controls.
- [ ] Verify returning from a pushed screen or dismissed sheet preserves the intended tab state and unsaved journal drafts.

### Task 5: Integrated iPhone quality review

- [ ] Run `npm run test -- --run`, `npm run typecheck`, `npm run typecheck:ios`, `npm run test:ios -- --runInBand`, `npx expo-doctor`, and `npx expo export --platform ios`.
- [ ] Review an iPhone-sized layout at 375 × 667 and 393 × 852 points; exercise onboarding, check-in, Add, Habits, Journal, Insights, and clear-data flows.
- [ ] Check keyboard reachability, safe areas, large text, VoiceOver names/order, contrast in Berry/Coastal/Grove light and dark variants, and reduced-motion behavior.
- [ ] Record the exact iPhone/browser environment and remaining device-build limitations. If an Expo/Apple signing account is available and a signed install is requested, create an EAS development build in a separate authorized step; do not submit it to the App Store.
- [ ] Commit each verified task with its code and focused tests.

## Environment Notes

- Expo SDK 58’s current support table lists iOS 16.4+ and requires Node 22.13 or later; the available Node runtime is 24.22. [Expo SDK 58 support](https://docs.expo.dev/versions/v58.0.0/)
- Expo Router native tabs use the system tab bar in SDK 58 and support stable five-tab navigation. [Native tabs guide](https://docs.expo.dev/router/advanced/native-tabs/)
- EAS Build can build iOS binaries on hosted macOS runners from a Windows development environment. A device-installable development build requires signing/device setup; an Expo account is needed to use EAS. [EAS Build](https://docs.expo.dev/build/), [iOS development build prerequisites](https://docs.expo.dev/tutorial/eas/ios-development-build-for-devices/)

## Review Handoff

Review this plan and confirm whether Expo React Native, a separate `apps/ios` project, iOS 16.4+, five native tabs, and local-only app data match the target. I recommend **Native** implementation because the shared data contracts, persistence provider, and routed feature screens depend on one another and should be checked together. If approved, reply **“Implement with Native”**; if you intended a SwiftUI-only app or need an earlier iOS target, say so and I’ll revise the plan before coding.
