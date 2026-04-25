import HomeClient from "../_components/HomeClient";
import { Stop } from "@/lib/types";
import { slugify } from "@/lib/utils/slug";
import { headers } from "next/headers";

interface PageProps {
  params: Promise<{ stopName: string }>;
}

async function resolveStopFromSlug(slug: string): Promise<Stop | null> {
  // Build base URL from incoming request headers (works in dev + Vercel)
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";
  if (!host) return null;
  const base = `${proto}://${host}`;

  // Use the slug itself as a search query (with hyphens replaced by spaces)
  const query = slug.replace(/-/g, " ");

  try {
    const res = await fetch(`${base}/api/stops?q=${encodeURIComponent(query)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const stops: Stop[] = data.stops || [];

    // Prefer exact slug match; otherwise first result
    const exact = stops.find((s) => slugify(s.name) === slug);
    return exact ?? stops[0] ?? null;
  } catch {
    return null;
  }
}

export default async function StopPage({ params }: PageProps) {
  const { stopName } = await params;
  const slug = decodeURIComponent(stopName).toLowerCase();
  const resolved = await resolveStopFromSlug(slug);

  return <HomeClient initialStop={resolved} suppressFavoritesAutoload={true} />;
}
