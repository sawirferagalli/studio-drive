import Link from "next/link";
import { lavori } from "@/lib/data";

function FolderIcon() {
  return (
    <svg
      className="folder-icon"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z" />
    </svg>
  );
}

export default function LavoriPage() {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Lavori</h1>
          <p>{lavori.length} progetti</p>
        </div>
        <button className="new-folder-btn" type="button">
          + Nuovo progetto
        </button>
      </div>

      <div className="grid">
        {lavori.map((cartella) => (
          <Link
            key={cartella.slug}
            href={`/lavori/${cartella.slug}`}
            className="folder-card"
          >
            <FolderIcon />
            <p className="folder-name">{cartella.nome}</p>
            <p className="folder-meta">Cartella</p>
          </Link>
        ))}

        <div className="folder-card folder-card--add">
          <FolderIcon />
          <p className="folder-name">Aggiungi cartella</p>
        </div>
      </div>
    </>
  );
}
