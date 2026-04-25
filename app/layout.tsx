import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "KVB Abfahrtsmonitor",
  description: "Echtzeit-Abfahrten der Kölner Verkehrs-Betriebe",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KVB Monitor",
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
      </body>
    </html>
  );
}
