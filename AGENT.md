# AGENT.md

Spezifikation für AI-Coding-Agents (Claude Code, Cursor, OpenCode, Copilot Workspace, etc.). Kurz, faktisch, beschreibt **wie** in diesem Repo gearbeitet wird.

---

## 1. Project Overview

**kvb-monitor** ist eine Next.js-16-Webapp, die Echtzeit-Abfahrten der Kölner Verkehrs-Betriebe (KVB) anzeigt. Datenquelle ist die **VRR EFA Test-API**, ergänzt um statische KVB-OpenData-Routen. Die App ist deutschsprachig, mobile-first, ohne Login/Backend, gehostet auf Vercel.

**Zielgruppen-Tonalität**: Nutzer wollen *schnell* wissen, wann die nächste Bahn kommt. Jede UI-Friction ist Bug.

---

## 2. Tech Stack

- Next.js **16.x** (App Router, RSC)
- React **19**
- TypeScript **5** (strict)
- TailwindCSS **3** (`darkMode: "class"`, alle Farben via CSS-Variablen)
- Node **18+** (für `fetch` ohne Polyfill)
- Keine zusätzlichen UI-Libraries, keine State-Manager, keine Form-Libs

---

## 3. Architektur

### Datenfluss

```
User → SearchBar → /api/stops          (EFA XML_STOPFINDER_REQUEST)
                ↓
          Stop-Auswahl
                ↓
      router.replace('/<slug>')
                ↓
    /[stopName] (RSC) → /api/stops      (Slug-Resolution serverseitig)
                ↓
       <HomeClient initialStop>
                ↓
      useDepartures (30s polling)
                ↓
        /api/departures               (EFA XML_DM_REQUEST)
                ↓
          DepartureList
                ↓
          DepartureItem → TripDetailsModal → /api/trip
                                            (EFA XML_TRIP_REQUEST2)
```

### State

- **FavoritesContext** (`contexts/FavoritesContext.tsx`) — Single source of truth für Favoriten. `useFavorites` ist nur Wrapper.
- **ThemeContext** (`contexts/ThemeContext.tsx`) — `light | dark | system`, persistiert in `localStorage["kvb-theme"]`, `matchMedia`-Listener für System-Mode.
- **useDepartures** — 30 s polling, prefer `stopId` (EFA-Format).
- Kein globaler App-State darüber hinaus — alles lokal in Komponenten.

### URL-Routing

- `/` → Home (Favoriten-Auto-Load aktiv)
- `/[stopName]` → SSR resolved Slug → Stop, lädt Departures, **kein** Favoriten-Auto-Load (`suppressFavoritesAutoload`)
- Slugs sind ASCII (`ü→ue`, `ö→oe`, `ä→ae`, `ß→ss`), generiert in `lib/utils/slug.ts`. Single Source of Truth — beide (Erzeugung & Parsing) laufen über `slugifyStopName` / `normalizeStopName`.

---

## 4. Code Conventions

- **TypeScript strict**. Kein `any` außer dokumentierten EFA-Response-Stellen (markiere mit `// EFA-shape`).
- `"use client"` nur dort, wo nötig (State/Hooks/Browser-APIs). Default ist Server Component.
- **CSS**: Nur Tailwind-Klassen + CSS-Variablen für Theme-Tokens (`var(--background)`, `var(--primary)`, …). Keine inline-styles für Farben.
- **A11y**: alle interaktiven Elemente brauchen `aria-label`. Tastatur-Pfade müssen funktionieren. `aria-disabled` bei abgesagten Departures.
- **Naming**: `PascalCase.tsx` für Components, `camelCase.ts` für Hooks/Utils, `kebab-case` nicht verwendet.
- **Imports**: absolute via `@/` (siehe `tsconfig.json` Pfad-Alias).
- **Kommentare**: nur wo *warum* nicht offensichtlich ist. Kein „dieser Code macht X".

---

## 5. API Contracts

| Route | Quelle | Returns |
|---|---|---|
| `GET /api/stops?q=…` | EFA STOPFINDER | `{ stops: Stop[] }` (max 20, Köln-only, dedupe by normalized name) |
| `GET /api/departures?stopId=…` oder `?name=…` | EFA DM | `{ departures: Departure[] }` |
| `GET /api/trip?tripId=…` | EFA TRIP | `{ stops: TripStop[] }` |
| `GET /api/route?lineId=…` | `lib/data/kvb-routes.json` | `{ stops: string[] }` |

Stop-IDs sind im EFA-Format `de:05315:NNNNN` (Köln-Municipality-Prefix). Alte KVB-ASS-IDs werden via `lib/storage.ts`-Migration (`kvb-favorites-migrated-v2`) einmalig gepurged.

---

## 6. Datenpipeline

`lib/data/kvb-routes.json` ist **build-time generiert**, **niemals manuell editieren**. Aktualisierung:

```bash
node scripts/fetch-routes.mjs
```

GitHub Action (`.github/workflows/update-routes.yml`) führt das wöchentlich automatisch aus und committed Änderungen.

Quelle: KVB OpenData (Windows-1252-encoded, wird im Script dekodiert).

---

## 7. Critical Behaviors

### Stop-Naming

**Immer** `normalizeStopName()` aus `lib/utils/stopName.ts` durchlaufen, bevor ein Stop-Name gerendert oder gespeichert wird. Das strippt das Präfix `Köln ` / `Köln, ` — sonst sehen User „Köln Hansaring" statt „Hansaring".

```ts
import { normalizeStopName, isKoelnStop, KOELN_ID_PREFIX } from "@/lib/utils/stopName";
```

### EFA-Eigenheiten (wichtige Lessons)

- EFA liefert für gleiche Station **zwei Record-Typen**:
  - **Type-A** (clean): `parent.name = "Longerich"`, `disassembledName = "Herforder Str."`
  - **Type-B** (polluted): `parent.name = "Köln"`, `disassembledName = "Köln Longerich Meerfeldstr."`
  - Filter via **ID-Prefix** `de:05315:`, **nicht** via `parent.name === "Köln"` (würde Type-A wegwerfen).
  - Dedupe by `normalizeStopName()`, behalte höchste `matchQuality`.
- `realtimeStatus` ist **Array, kein String**. Werte: `MONITORED`, `PREDICTED`, `EXTRA_TRIP`, `EXTRA_STOPS`, `TRIP_CANCELLED`, `STOP_CANCELLED`.
- `isCancelled` allein ist unzuverlässig — immer mit `realtimeStatus.includes("TRIP_CANCELLED")` kombinieren.
- `hints` enthält viel statisches Zeug (Type=`Timetable`: WLAN, Toiletten). **Nur** `RTIncidentCall`, `Stop`, `Line` durchlassen.

### JSX-Falsy-Falle

`{value && <X />}` mit `value: number` rendert `0` als sichtbaren Text. **Niemals**:

```tsx
{delay && delay > 0 && <Delay />}    // ❌ rendert "0" wenn delay=0
{delay !== undefined && delay > 0 && <Delay />}   // ✅
```

API-Schicht setzt `delay = undefined` bei 0 (= on-time, keine Anzeige).

### Theme & Hydration

- Inline-Pre-Hydration-Script in `app/layout.tsx` setzt `class="dark"` *vor* React mounted → kein FOUC.
- `<html suppressHydrationWarning>` weil das Script den DOM vor Hydration ändert.
- Niemals `text-white` oder `text-black` direkt — immer `text-[var(--background)]` o.ä. für Theme-Sicherheit.

### Favoriten-Migration

`lib/storage.ts` migriert einmalig alte KVB-ASS-IDs (Schlüssel: `kvb-favorites-migrated-v2`). Beim Hinzufügen weiterer Migrationen → neuen Versions-Suffix verwenden.

### Zeitzone — IMMER explizit

- EFA-API arbeitet mit lokaler Köln-Zeit (CET/CEST). **Vercel-Server läuft default in UTC** → ohne TZ-explizite Logik sind alle Zeiten 1–2 h verschoben (klassischer „alle Abfahrten als sofort" Bug).
- **Niemals in API-Routen oder server-rendered Code**:
  - `new Date().getHours()` / `getMinutes()` / `getDate()`
  - `toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })` ohne `timeZone`
- **Stattdessen** Helper aus `lib/utils/berlinTime.ts` verwenden:
  ```ts
  import { getBerlinDateParts, formatBerlinTime, formatBerlinDate } from "@/lib/utils/berlinTime";
  ```
- Auch in Client-Components, die Köln-Verkehrsdaten formatieren (z.B. Trip-Modal): `timeZone: "Europe/Berlin"` setzen — sonst sieht ein User in London „13:30" statt „14:30".
- `vercel.json` setzt zusätzlich `TZ=Europe/Berlin` als Belt-and-Suspenders. Der Code-Fix bleibt aber die Hauptlösung (deploy-target-agnostisch, Edge-Runtime-kompatibel).
- ISO-Timestamps mit Offset (z.B. `2026-04-26T14:30:00+02:00`) sind unproblematisch — `Date.parse` versteht sie korrekt. Kritisch wird es nur bei `getX()` und `toLocaleX()` ohne TZ.

---

## 8. Common Tasks

### Neue UI-Komponente

1. Datei in `components/PascalCase.tsx`
2. `"use client"` nur falls State/Hook/Browser-API
3. Farben via CSS-Variablen (`bg-[var(--surface)]`, …)
4. ARIA-Labels prüfen, Tastatur-Test
5. Light + Dark visuell verifizieren

### Neue API-Route

1. `app/api/<name>/route.ts` mit `export async function GET(req: Request)`
2. EFA-Response gegen echtes Backend verifizieren — XML-Schema-Drift kommt vor
3. Bei Stop-Namen: durch `normalizeStopName()`
4. Fehler als `{ error: string }` mit passendem Status

### Neuer Stop-Daten-Felder

1. `lib/types.ts` zuerst erweitern
2. `/api/stops` und ggf. `/api/departures` ergänzen
3. UI-Komponenten anpassen
4. `npm run build` muss grün sein

### URL-Slug-Änderung

`lib/utils/slug.ts` ist Single Source of Truth. **Nicht** dupliziert in Components.

---

## 9. Testing & Verification

- `npm run build` muss vor jedem Commit grün sein. Es gibt (noch) keine Unit-Tests.
- **Manuelle Smoke-Tests** decken folgende Cases ab:
  - `Hansaring` — typischer Stadtbahn-Stop
  - `Scheibenstr.` — einfache Tram-Haltestelle (war Initial-Bug)
  - `Zollstock Südfriedhof` — District-Prefix bleibt erhalten
  - `Köln Hbf` — großer Knotenpunkt mit S/RE
  - Linie 5 abends → testet Cancellation-Anzeige
- Theme-Toggle: light → dark → system → light, FOUC bei Reload prüfen
- URL-Sharing: `/hansaring` direkt aufrufen → muss funktionieren
- Favoriten: in Tab A toggeln, Tab B muss bei Reload synchron sein

---

## 10. Pitfalls / Lessons Learned

| Pitfall | Lösung |
|---|---|
| `parent.name === "Köln"`-Filter dropped Type-A-Records | ID-Prefix-Filter `de:05315:` |
| `{0}{0}` rendert als „00" in JSX | `value !== undefined &&` statt `value &&` |
| Doppelte Departures (gleiche IDs) → React-Key-Warnings | Composite-Key: `${tripId}-${number}-${plannedTime}-${idx}` |
| FOUC beim Theme-Wechsel | Inline-Script vor `<body>` |
| Stop-Namen mit „Köln "-Präfix sehen unprofessionell aus | `normalizeStopName()` *überall* |
| `isRealtime`-Boolean reicht nicht für Status-UI | `realtimeQuality: "live" \| "predicted" \| "scheduled" \| "extra" \| "cancelled" \| "stop-cancelled"` |
| EFA-Hints voller statischer WLAN-Hinweise | Filter auf `RTIncidentCall \| Stop \| Line` |
| Trip-Modal `isPassed` ungenau | Heuristik mit `point.$ === "PATTERN_MAP"` — bekannt unscharf |
| `ESTIMATED_MINUTES_PER_STOP = 2` hardcoded | Akzeptiert, nicht kritisch |
| Vercel-Server in UTC → Abfahrten alle „sofort" | `lib/utils/berlinTime.ts` + `vercel.json` mit `TZ=Europe/Berlin` |

---

## 11. Out of Scope (jetzt)

- Push-Notifications
- User-Accounts / Cloud-Favoriten / Sync
- Mehrsprachigkeit (DE only)
- Offline-Modus für Live-Daten
- Native-App-Wrapper (PWA reicht)
- Custom Backend (EFA direkt ist genug)

---

## 12. References

- **VRR EFA**: https://openservice-test.vrr.de/openservice (Test-API)
- **EFA-Doku** (inoffiziell): https://github.com/mfdz/efa-api-doc
- **KVB OpenData**: https://www.kvb.koeln/service/opendata.html
- **Next.js App Router**: https://nextjs.org/docs/app
- **opendata-oepnv.de**: https://www.opendata-oepnv.de (für Produktiv-Endpunkt)

---

## 13. Quick Sanity Checks (für Agents)

Bevor du einen PR/Commit erzeugst:

- [ ] `npm run build` grün?
- [ ] Stop-Namen durch `normalizeStopName()` gelaufen?
- [ ] Keine `text-white` / `text-black` neu eingeführt?
- [ ] Keine `{number && …}`-Patterns?
- [ ] Cancelled-Departure noch klickbar (für Trip-Modal)?
- [ ] Light **und** Dark visuell gecheckt?
- [ ] ARIA-Labels auf neuen Buttons?
- [ ] `lib/data/kvb-routes.json` *nicht* manuell verändert?
