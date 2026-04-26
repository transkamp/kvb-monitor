# 🚊 KVB Abfahrtsmonitor

> Echtzeit-Abfahrten der Kölner Verkehrs-Betriebe — schnell, minimal, ohne Klickstrecke.

Ein hobbyistisches Side-Project für alle, die einfach nur wissen wollen, wann die nächste Bahn kommt — ohne Werbung, ohne Login, ohne 17 Tabs in einer App. Tippe deine Haltestelle, sieh die Abfahrten, fertig.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/transkamp/kvb-monitor)

---

## ✨ Features

- 🔍 **Live-Suche** über alle KVB-Haltestellen (VRR EFA)
- 🚊 **Echtzeit-Abfahrten** mit Verspätungs-Indikator und Live-Pulse-Animation
- ⛔ **Ausfälle & Sonderfahrten** klar markiert (Strike-through, „Hält nicht", „Sonderfahrt")
- ℹ️ **Live-Hinweise** (Störungen, Umleitungen) inline ausklappbar
- ⭐ **Favoriten** mit einem Klick, persistent in localStorage
- 🗺️ **Trip-Details** mit Haltestellen-Liste, Verspätungen pro Stop und Fortschrittsanzeige
- 🔗 **Teilbare URLs** — `kvb-monitor.app/hansaring`, `kvb-monitor.app/scheibenstr` und so weiter
- 🌗 **Light / Dark / System** Theme mit FOUC-Prevention
- 📲 **Installierbar als App** (PWA) — auf Homescreen oder Desktop ablegen
- ♿ **WCAG-AA** Kontraste, Tastatur-Navigation, ARIA-Labels durchgehend
- 📱 **Mobile-first**, Swipe-Gesten, voll responsiv

---

## 🚀 Quickstart

```bash
git clone https://github.com/transkamp/kvb-monitor.git
cd kvb-monitor
npm install
npm run dev
```

Öffne dann [http://localhost:3000](http://localhost:3000).

Keine API-Keys nötig — alle Datenquellen sind öffentlich.

### Routen-Daten aktualisieren

Die statischen Linien-Routen unter `lib/data/kvb-routes.json` werden wöchentlich automatisch via GitHub Action aktualisiert. Manuell:

```bash
node scripts/fetch-routes.mjs
```

---

## 🛠️ Tech Stack

- **Next.js 16** (App Router, React Server Components)
- **React 19** + **TypeScript** (strict)
- **TailwindCSS 3** mit CSS-Variablen für Theming
- **VRR EFA** (`XML_STOPFINDER_REQUEST`, `XML_DM_REQUEST`, `XML_TRIP_REQUEST2`)
- **KVB OpenData** (für statische Routen-Anreicherung)
- Hosting: **Vercel** (Free Tier reicht)

---

## 📁 Projekt-Struktur

```
kvb-monitor/
├── app/                    # Next.js App Router
│   ├── api/                # Proxy-Endpunkte (stops, departures, trip, route)
│   ├── [stopName]/         # Dynamic Route mit SSR-Slug-Resolution
│   ├── _components/        # HomeClient (Client UI)
│   ├── globals.css         # Light + Dark CSS-Var-Palette
│   └── layout.tsx          # ThemeProvider + FavoritesProvider + FOUC-Script
├── components/             # UI-Komponenten (DepartureItem, SearchBar, …)
├── contexts/               # FavoritesContext, ThemeContext
├── hooks/                  # useDepartures, useFavorites
├── lib/
│   ├── api.ts              # Client-API-Wrapper
│   ├── storage.ts          # localStorage-Helpers + Migrations
│   ├── types.ts            # Domain-Typen
│   ├── data/kvb-routes.json # Build-Time-generiert
│   └── utils/              # stopName, slug, lineColors
├── scripts/                # fetch-routes.mjs (Datenpipeline)
└── .github/workflows/      # update-routes.yml (Cron)
```

---

## 🌐 Deployment

### Vercel (empfohlen)

1. Repo auf GitHub forken/pushen
2. Auf [vercel.com](https://vercel.com/new) importieren
3. „Deploy" — fertig. Keine Env-Vars nötig.

### Selbst hosten

```bash
npm run build
npm start
```

Läuft auf jedem Node-18+ Host.

---

## 🎨 Design

Skandinavisch-minimal, monochrome Basis mit Blau-Akzent. Vollständig themeable über CSS-Variablen in `app/globals.css`.

| Token        | Light     | Dark      |
|--------------|-----------|-----------|
| background   | `#FAFAFA` | `#0F1115` |
| surface      | `#FFFFFF` | `#1A1D24` |
| primary      | `#1A1A1A` | `#F3F4F6` |
| accent       | `#2563EB` | `#60A5FA` |

---

## 🌐 Browser-Support

Alle modernen Browser (Chrome, Firefox, Safari, Edge — letzten 2 Versionen). Kein IE.

---

## 📄 Datenquellen

- **VRR EFA Test-API** — `https://openservice-test.vrr.de/openservice` (öffentlich, keine Keys)
- **KVB OpenData** — `https://data.webservice-kvb.koeln/service/opendata` (statische Linien-Routen)

> ⚠️ **Hinweis:** Die VRR-Test-API ist nicht für produktiven Hochlast-Betrieb vorgesehen. Für ernsthafte Nutzung über das Hobby-Niveau hinaus sollte der Produktiv-Endpunkt mit Registrierung verwendet werden — siehe [opendata-oepnv.de](https://www.opendata-oepnv.de).

---

## ⚖️ Disclaimer

Dieses Projekt ist **nicht offiziell mit der Kölner Verkehrs-Betriebe AG (KVB) assoziiert**. Es handelt sich um ein unabhängiges Hobby-Projekt, das öffentlich zugängliche Daten visualisiert. „KVB" ist eine Marke der Kölner Verkehrs-Betriebe AG.

Die angezeigten Daten kommen direkt von VRR/KVB und werden nicht modifiziert — Genauigkeit und Verfügbarkeit liegen bei den Betreibern der Quell-APIs.

---

## 🐛 Bekannte Einschränkungen

- VRR-Test-API kann zeitweise langsam oder ausgefallen sein
- Keine Push-Notifications
- Kein Offline-Modus für Live-Daten (Favoriten-Liste funktioniert offline)
- Trip-Fortschrittsanzeige nutzt eine Heuristik — nicht millimetergenau

---

## 🤝 Mitwirken

Issues und PRs willkommen. Für AI-Coding-Agents (Claude Code, Cursor, OpenCode, Copilot Workspace) gibt es eine eigene Spezifikation in [`AGENT.md`](./AGENT.md) mit Konventionen, Pitfalls und Architektur-Notizen.

---

## 📜 Lizenz

[MIT](./LICENSE) © 2026 transkamp
