import type { Metadata } from "next";
import Link from "next/link";
import { getLegalData } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Impressum — KVB Abfahrtsmonitor",
  description: "Angaben gemäß § 5 DDG",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ImpressumPage() {
  const legal = getLegalData();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--primary)] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <nav className="mb-6">
          <Link
            href="/"
            className="text-sm text-[var(--secondary)] hover:text-[var(--primary)] transition-colors inline-flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Zurück zur Hauptseite
          </Link>
        </nav>

        <h1 className="text-3xl font-bold mb-6">Impressum</h1>

        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">
              Angaben gemäß § 5 DDG
            </h2>
            <address className="not-italic">
              <p>{legal.name}</p>
              <p>{legal.addressLine1}</p>
              <p>{legal.addressLine2}</p>
              <p>{legal.zipCity}</p>
            </address>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Kontakt</h2>
            <p>
              E-Mail:{" "}
              <a
                href={`mailto:${legal.email}`}
                className="text-[var(--accent)] hover:underline"
                aria-label="E-Mail-Adresse, öffnet E-Mail-Programm"
              >
                {legal.email}
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p>
              {legal.name}, {legal.addressLine2}, {legal.zipCity}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Haftungsausschluss</h2>

            <h3 className="font-medium mt-4 mb-1">Haftung für Inhalte</h3>
            <p className="text-sm leading-relaxed">
              Die Inhalte dieser Seiten werden mit größtmöglicher Sorgfalt
              erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität
              der Inhalte kann jedoch keine Gewähr übernommen werden. Die
              angezeigten Abfahrts-, Stop- und Routendaten stammen aus
              öffentlich zugänglichen Quellen (VRR EFA und KVB OpenData) und
              werden unverändert dargestellt; ihre Verfügbarkeit und
              Genauigkeit liegt bei den Betreibern der Quell-APIs.
            </p>

            <h3 className="font-medium mt-4 mb-1">Haftung für Links</h3>
            <p className="text-sm leading-relaxed">
              Diese Seite enthält Links zu externen Websites Dritter, auf
              deren Inhalte wir keinen Einfluss haben. Deshalb kann für diese
              fremden Inhalte auch keine Gewähr übernommen werden.
            </p>

            <h3 className="font-medium mt-4 mb-1">Urheberrecht</h3>
            <p className="text-sm leading-relaxed">
              Der Quellcode dieser Anwendung steht unter der MIT-Lizenz und
              ist auf{" "}
              <a
                href="https://github.com/transkamp/kvb-monitor"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                GitHub
              </a>{" "}
              einsehbar.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Hinweis</h2>
            <p className="text-sm leading-relaxed">
              Dieses Projekt ist nicht offiziell mit der Kölner
              Verkehrs-Betriebe AG (KVB) assoziiert. Es handelt sich um ein
              unabhängiges Hobby-Projekt, das öffentlich zugängliche Daten
              visualisiert. „KVB" ist eine Marke der Kölner Verkehrs-Betriebe
              AG.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
