import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "KVB Abfahrtsmonitor",
  description: "Echtzeit-Abfahrten der Kölner Verkehrs-Betriebe",
  manifest: "/manifest.webmanifest",
  applicationName: "KVB Monitor",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KVB Monitor",
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1115" },
  ],
};

// Inline script to set theme class before hydration (avoids FOUC)
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('kvb-theme') || 'system';
    var resolved = stored === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : stored;
    if (resolved === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <FavoritesProvider>{children}</FavoritesProvider>
        </ThemeProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
