const LINE_IDS_STADTBAN = ["1", "3", "4", "5", "7", "9", "12", "13", "15", "16", "17", "18"];
const LINE_IDS_BUS = ["106", "120", "121", "122", "123", "124", "125", "126", "130", "131", "132", "133", "134", "135", "136", "138", "139", "140", "142", "146", "150", "153", "154"];

const ALL_LINES = [...LINE_IDS_STADTBAN, ...LINE_IDS_BUS];
const BASE_URL = "https://www.kvb.koeln/haltestellen/showline/29";
const KVB_STOPS_URL = "https://data.webservice-kvb.koeln/service/opendata/haltestellen/json";

// Windows-1252 to UTF-8 fix (common special characters)
const win1252ToUtf8: Record<number, string> = {
  0x80: "\u20AC",  // Euro sign
  0x82: "\u201A",  // Single low-9 quotation mark
  0x83: "\u0192",  // Latin small letter f with hook
  0x84: "\u201E",  // Double low-9 quotation mark
  0x85: "\u2026",  // Horizontal ellipsis
  0x86: "\u2020",  // Dagger
  0x87: "\u2021",  // Double dagger
  0x88: "\u02C8",  // Modifier letter vertical line
  0x89: "\u2030",  // Per mille sign
  0x8A: "\u0160",  // Latin capital letter S with caron
  0x8B: "\u2039",  // Single left-pointing angle quotation mark
  0x8C: "\u0152",  // Latin capital ligature OE
  0x8E: "\u017D",  // Latin capital letter Z with caron
  0x91: "\u2018",  // Left single quotation mark
  0x92: "\u2019",  // Right single quotation mark
  0x93: "\u201C",  // Left double quotation mark
  0x94: "\u201D",  // Right double quotation mark
  0x95: "\u2022",  // Bullet
  0x96: "\u2013",  // En dash
  0x97: "\u2014",  // Em dash
  0x98: "\u02DC",  // Small tilde
  0x99: "\u2122",  // Trade mark sign
  0x9A: "\u0161",  // Latin small letter s with caron
  0x9B: "\u203A",  // Single right-pointing angle quotation mark
  0x9C: "\u0153",  // Latin small ligature oe
  0x9E: "\u017E",  // Latin small letter z with caron
  0x9F: "\u0178",  // Latin capital letter Y with diaeresis
  // German special chars (Windows-1252)
  0xE4: "ä", // a umlaut
  0xF6: "ö", // o umlaut
  0xFC: "ü", // u umlaut
  0xC4: "Ä", // A umlaut
  0xD6: "Ö", // O umlaut
  0xDC: "Ü", // U umlaut
  0xDF: "ß", // sharp s
};

function convertWin1252ToUtf8(buffer: Buffer): string {
  let result = "";
  const bytes = buffer.toString("binary");
  for (let i = 0; i < bytes.length; i++) {
    const code = bytes.charCodeAt(i);
    if (code > 127 && win1252ToUtf8[code]) {
      result += win1252ToUtf8[code];
    } else {
      result += bytes[i];
    }
  }
  return result;
}

// HTML entity replacement (already encoded in some cases)
const htmlEntities: Record<string, string> = {
  "&ouml;": "ö",
  "&uuml;": "ü",
  "&auml;": "ä",
  "&szlig;": "ß",
  "&Ouml;": "Ö",
  "&Uuml;": "Ü",
  "&Auml;": "Ä",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
};

function decodeText(text: string): string {
  // First handle HTML entities
  let decoded = text;
  for (const [entity, char] of Object.entries(htmlEntities)) {
    decoded = decoded.split(entity).join(char);
  }
  // Clean up extra text in parentheses like "Niehl (ab 12.12.2021 Niehl Nord)" -> "Niehl"
  decoded = decoded.replace(/\s*\(ab\s+\d{1,2}\.\d{1,2}\.\d{2,4}\s+[^)]+\)/gi, "");
  // Clean up extra whitespace
  decoded = decoded.replace(/\s{2,}/g, " ").trim();
  return decoded;
}

// === KVB OpenData Stop enrichment ===

interface StopInfo {
  name: string;
  shortName: string;
  ass: number;
}

interface RouteStop {
  name: string;
  shortName?: string;
  ass?: number;
}

async function fetchAllStops(): Promise<StopInfo[]> {
  try {
    const res = await fetch(KVB_STOPS_URL);
    if (!res.ok) {
      console.error(`HTTP ${res.status} loading KVB stops`);
      return [];
    }
    // KVB OpenData is encoded in Windows-1252 (not UTF-8 despite JSON content-type)
    const buffer = await res.arrayBuffer();
    const decoder = new TextDecoder("windows-1252");
    const text = decoder.decode(buffer);
    const data = JSON.parse(text);
    if (!data.features || !Array.isArray(data.features)) return [];

    return data.features.map((f: { properties: { Name: string; Kurzname: string; ASS: number } }) => ({
      name: f.properties.Name,
      shortName: f.properties.Kurzname,
      ass: f.properties.ASS,
    }));
  } catch (error) {
    console.error(`Error fetching KVB stops: ${error}`);
    return [];
  }
}

function findStop(allStops: StopInfo[], stopName: string): StopInfo | null {
  const lowerStop = stopName.toLowerCase().trim();

  // 1. Exact match
  const exact = allStops.find(s => s.name.toLowerCase().trim() === lowerStop);
  if (exact) return exact;

  // 2. Partial match (substring in either direction)
  for (const s of allStops) {
    const lowerName = s.name.toLowerCase().trim();
    if (lowerName.includes(lowerStop) || lowerStop.includes(lowerName)) {
      return s;
    }
  }
  return null;
}

async function fetchLineStops(lineNumber: string): Promise<string[]> {
  const url = `${BASE_URL}/${lineNumber}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (KVB-Monitor Route Update)',
      },
    });
    
    if (!response.ok) {
      console.error(`HTTP ${response.status}: ${lineNumber}`);
      return [];
    }
    
    // Get the response as raw bytes to handle Windows-1252
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("windows-1252");
    const html = decoder.decode(buffer);
    
    // Collect ALL stops
    const allStops: string[] = [];
    const regex = /ref='\/haltestellen\/overview\/\d+\/'>([^<]+)<\/a>/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const stopName = match[1];
      if (stopName) {
        allStops.push(stopName);
      }
    }
    
    // Find turnaround point
    const seen = new Set<string>();
    const inboundStops: string[] = [];
    
    for (const stop of allStops) {
      if (seen.has(stop)) {
        break;
      }
      seen.add(stop);
      inboundStops.push(stop);
    }
    
    // Decode HTML entities and remove duplicates
    const uniqueInbound: string[] = [];
    const seenNames = new Set<string>();
    
    for (const stop of inboundStops) {
      const decoded = decodeText(stop);
      if (!seenNames.has(decoded)) {
        seenNames.add(decoded);
        uniqueInbound.push(decoded);
      }
    }
    
    console.log(`  -> ${uniqueInbound.length} stops`);
    return uniqueInbound;
  } catch (error) {
    console.error(`Error: ${error}`);
    return [];
  }
}

async function main() {
  console.log(`Fetching ${ALL_LINES.length} lines...\n`);

  const routes: Record<string, RouteStop[]> = {};
  const routeNames: Record<string, string[]> = {};

  // Phase 1: Fetch all line routes (stop names only)
  for (let i = 0; i < ALL_LINES.length; i++) {
    const lineNumber = ALL_LINES[i];
    console.log(`[${i + 1}/${ALL_LINES.length}] Line ${lineNumber}:`);

    const stops = await fetchLineStops(lineNumber);

    if (stops.length > 0) {
      routeNames[lineNumber] = stops;
      console.log(`  => ${stops[0]} ... ${stops[stops.length - 1]}`);
    } else {
      console.log(`  => No data`);
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Phase 2: Fetch KVB OpenData stops once and enrich routes
  console.log(`\n=== Enriching with KVB OpenData ===`);
  const allStops = await fetchAllStops();
  console.log(`Loaded ${allStops.length} stops from KVB OpenData\n`);

  for (const [lineNumber, stopNames] of Object.entries(routeNames)) {
    const enriched: RouteStop[] = [];
    const missing: string[] = [];

    for (const stopName of stopNames) {
      const info = findStop(allStops, stopName);
      const entry: RouteStop = { name: stopName };
      if (info?.shortName) entry.shortName = info.shortName;
      if (info?.ass) entry.ass = info.ass;
      enriched.push(entry);

      if (!info) missing.push(stopName);
    }

    routes[lineNumber] = enriched;
    const matched = stopNames.length - missing.length;
    const status = missing.length === 0 ? "✓" : "⚠";
    console.log(`${status} Line ${lineNumber}: ${matched}/${stopNames.length}` +
      (missing.length > 0 ? ` — missing: ${missing.join(", ")}` : ""));
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total routes: ${Object.keys(routes).length}`);

  const fs = await import('fs');
  fs.mkdirSync("./lib/data", { recursive: true });
  fs.writeFileSync("./lib/data/kvb-routes.json", JSON.stringify(routes, null, 2));
  console.log(`Saved to lib/data/kvb-routes.json`);

  // Show sample for line 12
  if (routes["12"]) {
    console.log(`\nLine 12 (${routes["12"].length} stops):`);
    console.log(`  ${routes["12"].map(s => s.name).join(" -> ")}`);
  }
}

main().catch(console.error);