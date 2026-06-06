# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # Expo dev server (scan QR with Expo Go)
npm run ios            # iOS Simulator
npm run android        # Android Emulator
npm run web            # Browser via Metro
npm run lint           # ESLint
npm run reset          # Clear Expo cache and restart (scripts/reset.sh)
npm run clean          # Remove node_modules and reinstall (scripts/clean.sh)
```

When changing Babel config or adding new native packages, always restart with `npx expo start --clear`.

## Stack

- **Expo SDK 54** · React Native 0.81 · React 19 · TypeScript 5.9
- **expo-router v6** — file-based routing, typed routes enabled
- **react-native-svg** — SVG map in `karte.tsx`
- **expo-linear-gradient** — card/header backgrounds throughout
- **react-native-reanimated v4** + **react-native-worklets** — installed but NOT used in screens; use React Native's built-in `Animated` API instead (reanimated causes `Exception in HostFunction` in Expo Go SDK 54)
- **react-native-webview** — renders the globe via inline HTML from `constants/globeHtml.ts`
- **@react-native-async-storage/async-storage** — persists all app state under key `@auswando_v1`

> **Important:** Do NOT import from `react-native-reanimated` in screen files.

## Architecture

### Global State (`context/AppContext.tsx`)

`AppProvider` wraps the root layout and exposes `useApp()` everywhere. State shape:

```ts
selectedCountry: CountryId       // 'pt' | 'es' | 'ch'
completedSteps: Record<CountryId, string[]>  // roadmap step titles
emigrationDate: string | null    // 'YYYY-MM'
onboardingSeen: boolean
```

All mutations (setCountry, toggleStep, setEmigrationDate, markOnboardingSeen) persist synchronously to AsyncStorage. The `loaded` flag gates rendering until storage has hydrated.

### Routing (`app/`)

- `app/_layout.tsx` — wraps tree in `AppProvider`, loads fonts, schedules daily 9am push notification, redirects to `/onboarding` if `onboardingSeen` is false
- `app/onboarding.tsx` — first-run screen; calls `markOnboardingSeen()` then replaces to `/(tabs)`
- `app/(tabs)/_layout.tsx` — 5-tab navigator (Start, Land-Test, Roadmap, Karte, Community)
- `app/(tabs)/index.tsx` — Home dashboard
- `app/(tabs)/test.tsx` — 6-question country-matching quiz with `Animated` card flip transitions
- `app/(tabs)/roadmap.tsx` — per-country phased emigration checklist; reads/writes `completedSteps` via `useApp()`
- `app/(tabs)/karte.tsx` — SVG Europe map with animated JS flight path (`setInterval`, not Reanimated)
- `app/(tabs)/community.tsx` — community feed with country filter
- `app/(tabs)/two.tsx` — **vestigial scaffold file**, not linked from tab layout; safe to ignore or delete

### Data & Theme (`constants/`)

- `constants/theme.ts` — exports `C` (light color palette), `COUNTRIES: Country[]` (Portugal, Spanien, Schweiz with map coords/colors/pros/cons), `GERMANY` (origin SVG coords), and `CountryId` type. Always use `C.*` for colors, never hardcode hex values.
- `constants/roadmapData.ts` — exports `ROADMAP_DATA: Record<CountryId, Phase[]>` with all 3-phase emigration steps per country. Each `Step` has `{ title, desc, free, icon, link? }`.
- `constants/images.ts` — centralizes `require()` calls for `LOGO` and `FLAG_IMAGES` (keyed by `CountryId`). Import from here, never inline `require()` in screens.
- `constants/globeHtml.ts` — inline HTML/JS template for the `react-globe.gl` WebView; replace `__CONFIG__` before injecting.

### Platform overrides

Files with `.web.tsx` / `.web.ts` suffix replace their native counterpart on web only:
- `app/(tabs)/karte.web.tsx` — web version of the map tab
- `components/AuswandoMap.web.tsx` — web map component
- `hooks/useColorScheme.web.ts`, `hooks/useClientOnlyValue.web.ts` — web-specific hook implementations

### Key patterns

- All screens: `<SafeAreaView edges={['top']}>` with `backgroundColor: C.bg`
- Gradients: `expo-linear-gradient` `<LinearGradient colors={[...]}>`
- SVG map: coordinates scaled by `SCALE = width / 380`
- Premium features: `<Modal>` bottom sheet with "49 €" purchase CTA; `free: boolean` on each roadmap `Step` determines locked/unlocked rendering
- Tab icons: `expo-symbols` `SymbolView` with `ios`/`android` name props

## Expo Go Compatibility

Target: **Expo Go SDK 54**. Install packages with `npx expo install <pkg>`. If `npm install` is needed, use `--legacy-peer-deps`.
