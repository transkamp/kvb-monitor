import type { Metadata } from "next";
import Link from "next/link";
import { getLegalData } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — KVB Abfahrtsmonitor",
  description: "Informationen zur Verarbeitung personenbezogener Daten",
  robots: {
    index: false,
    follow: false,
  },
};

const STAND = "April 2026";

export default function DatenschutzPage() {
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

        <h1 className="text-3xl font-bold mb-2">Datenschutzerklärung</h1>
        <p className="text-sm text-[var(--secondary)] mb-8">Stand: {STAND}</p>

        <section className="space-y-8 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold mb-2">
              1. Verantwortlicher
            </h2>
            <address className="not-italic">
              <p>{legal.name}</p>
              <p>{legal.addressLine1}</p>
              <p>{legal.addressLine2}</p>
              <p>{legal.zipCity}</p>
              <p className="mt-2">
                E-Mail:{" "}
                <a
                  href={`mailto:${legal.email}`}
                  className="text-[var(--accent)] hover:underline"
                  aria-label="E-Mail-Adresse, öffnet E-Mail-Programm"
                >
                  {legal.email}
                </a>
              </p>
            </address>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">2. Hosting</h2>
            <p>
              Diese Anwendung wird bei der Vercel Inc., 340 S Lemon Ave #4133,
              Walnut, CA 91789, USA gehostet. Beim Aufruf erhebt Vercel
              automatisch IP-Adresse, Browser-Typ und -Version,
              verwendetes Betriebssystem, Datum und Uhrzeit der Anfrage sowie
              die aufgerufene URL (Server-Logs). Diese Daten werden zur
              Sicherstellung eines stabilen Betriebs verarbeitet.
            </p>
            <p className="mt-2">
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
              Interesse am stabilen, sicheren Betrieb der Anwendung).
              Die App ist in der Region Frankfurt (eu-central) deployed,
              sodass die Anfragen primär innerhalb der EU verarbeitet werden.
              Vercel ist nach dem EU-US Data Privacy Framework zertifiziert.
            </p>
            <p className="mt-2">
              Weitere Informationen:{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                Datenschutzerklärung von Vercel
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              3. Datenverarbeitung durch Drittquellen
            </h2>
            <p>
              Die angezeigten Stop-, Abfahrts- und Routendaten werden über
              öffentliche APIs des Verkehrsverbundes Rhein-Ruhr (VRR EFA) und
              der Kölner Verkehrs-Betriebe AG (KVB OpenData) bezogen. Die
              Anfragen erfolgen serverseitig durch unsere Anwendung; Ihre
              IP-Adresse wird dabei nicht direkt an VRR oder KVB übermittelt.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              4. Lokale Speicherung im Browser
            </h2>
            <p>
              Die Anwendung speichert Ihre Favoriten und die gewählte
              Theme-Einstellung (hell / dunkel / System) ausschließlich lokal
              im <code>localStorage</code> Ihres Browsers. Diese Daten werden
              nicht an unseren Server oder Dritte übertragen. Sie können
              diese Daten jederzeit über die Einstellungen Ihres Browsers
              einsehen und löschen.
            </p>
            <p className="mt-2">
              Da diese Speicherung technisch erforderlich ist, um die
              Funktion der Anwendung bereitzustellen, ist hierfür keine
              Einwilligung erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">5. Cookies</h2>
            <p>Diese Anwendung verwendet keine Cookies.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              6. Tracking, Analytics, Werbung
            </h2>
            <p>
              Diese Anwendung verwendet keine Analyse-Tools, kein Tracking
              und keine Werbung.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">7. Externe Links</h2>
            <p>
              Diese Anwendung enthält Links zu externen Diensten, insbesondere
              zum Quellcode auf{" "}
              <a
                href="https://github.com/transkamp/kvb-monitor"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                GitHub
              </a>
              . Beim Klick auf solche Links werden Sie auf die Website des
              jeweiligen Anbieters weitergeleitet. Es gelten dann die dort
              veröffentlichten Datenschutzbestimmungen, auf deren Inhalt wir
              keinen Einfluss haben.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">8. Ihre Rechte</h2>
            <p>
              Ihnen stehen nach der Datenschutz-Grundverordnung folgende
              Rechte zu:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>
                Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)
              </li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
            </ul>
            <p className="mt-2">
              Zur Ausübung dieser Rechte wenden Sie sich bitte an die unter
              Punkt 1 angegebene E-Mail-Adresse.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              9. Beschwerderecht bei der Aufsichtsbehörde
            </h2>
            <p>
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde
              zu beschweren. Zuständig ist:
            </p>
            <address className="not-italic mt-2">
              <p>
                Landesbeauftragte für Datenschutz und Informationsfreiheit
                Nordrhein-Westfalen
              </p>
              <p>Kavalleriestraße 2-4</p>
              <p>40213 Düsseldorf</p>
              <p className="mt-2">
                <a
                  href="https://www.ldi.nrw.de/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline"
                >
                  www.ldi.nrw.de
                </a>
              </p>
            </address>
          </div>
        </section>
      </div>
    </main>
  );
}
