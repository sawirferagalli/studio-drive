import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";
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
  const isAuthed = cookies().has(AUTH_COOKIE);

  return (
    <html lang="it">
      <body>
        <img
          src="/sviluppo-urbano-logo.png"
          alt=""
          aria-hidden="true"
          className="bg-watermark"
        />
        <div className="shell">
          <header className="topbar">
            <span className="wordmark">Archivio Sviluppo Urbano</span>
            {isAuthed && (
              <form action="/api/logout" method="POST">
                <button type="submit" className="logout-btn">
                  Esci
                </button>
              </form>
            )}
          </header>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
