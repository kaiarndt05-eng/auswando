# Auswando

Dein persönlicher Begleiter für die Auswanderung nach Portugal, Spanien oder in die Schweiz.

Built with **Expo SDK 54** · React Native 0.81 · TypeScript · expo-router v6

## Was ist Auswando?

Auswando hilft deutschen Auswanderungswilligen dabei, den Überblick zu behalten:

- **Land-Test** – 6-Fragen-Quiz, das die passende Destination empfiehlt
- **Roadmap** – Schritt-für-Schritt-Checkliste (Vorbereitung → Abmeldung DE → Ankommen) für jedes Land
- **Karte** – Interaktive SVG-Karte Europas mit animierter Flugroute
- **Community** – Feed mit Erfahrungsberichten, nach Land gefiltert
- **Onboarding** – Geführter Einstieg beim ersten App-Start

Unterstützte Länder: 🇵🇹 Portugal · 🇪🇸 Spanien · 🇨🇭 Schweiz

## Quickstart

```bash
npm install
npm start          # Expo dev server (QR-Code für Expo Go scannen)
npm run ios        # iOS Simulator
npm run android    # Android Emulator
npm run web        # Browser
```

## Scripts

```bash
npm run setup    # Ersteinrichtung
npm run reset    # Expo-Cache leeren & neu starten
npm run clean    # node_modules entfernen & neu installieren
npm run lint     # ESLint
```

## Projektstruktur

```
app/              # Screens & Layouts (expo-router, dateibasiertes Routing)
  (tabs)/         # 5-Tab-Navigator (Start, Land-Test, Roadmap, Karte, Community)
  onboarding.tsx  # Erster App-Start
context/          # AppContext – globaler State + AsyncStorage-Persistenz
constants/
  theme.ts        # Farbpalette (C.*), COUNTRIES[], CountryId
  roadmapData.ts  # Roadmap-Phasen & Schritte je Land
  images.ts       # Zentralisierte require()-Importe
components/       # Wiederverwendbare UI-Komponenten
hooks/            # useColorScheme, useClientOnlyValue
assets/           # Fonts & Bilder (Flaggen, Logo)
scripts/          # Dev-Hilfsskripte
```

## Paketinstallation

Immer `npx expo install <pkg>` verwenden (SDK-54-kompatible Version). Falls `npm install` nötig: `--legacy-peer-deps` hinzufügen.

## Hinweise

- Kein `react-native-reanimated` in Screen-Dateien verwenden – nutze stattdessen React Natives eingebautes `Animated` API (Reanimated verursacht Fehler in Expo Go SDK 54)
- Nach Änderungen an `babel.config.js` oder neuen nativen Paketen: `npx expo start --clear`
