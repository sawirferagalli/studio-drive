import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Archivio progetti",
  description: "Archivio online dei progetti dello studio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <div className="shell">
          <header className="topbar">
            <span className="wordmark">Archivio</span>
          </header>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
