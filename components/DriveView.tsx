"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  type: "folder" | "file";
  name: string;
  blob_pathname: string | null;
  size: number | null;
};

type Crumb = { id: string; name: string };

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

function FileIcon() {
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
      <path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DriveView({
  folderId,
  title,
  items,
  breadcrumb,
}: {
  folderId: string | null;
  title: string;
  items: Item[];
  breadcrumb: Crumb[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function createFolder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = folderName.trim();
    if (!name) return;

    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentId: folderId }),
    });

    if (!res.ok) {
      setError("Non sono riuscito a creare la cartella.");
      return;
    }

    setFolderName("");
    setShowNewFolder(false);
    startTransition(() => router.refresh());
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const form = new FormData();
    form.append("file", file);
    if (folderId) form.append("parentId", folderId);

    const res = await fetch("/api/upload", { method: "POST", body: form });

    if (!res.ok) {
      setError("Non sono riuscito a caricare il file.");
    }

    e.target.value = "";
    startTransition(() => router.refresh());
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Eliminare "${name}"? L'operazione non si può annullare.`)) {
      return;
    }
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Non sono riuscito a eliminare l'elemento.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <>
      {breadcrumb.length > 0 && (
        <div className="breadcrumb-row">
          <Link href="/" className="breadcrumb">
            Drive
          </Link>
          {breadcrumb.map((c, i) => (
            <span key={c.id}>
              <span className="breadcrumb-sep">/</span>
              {i === breadcrumb.length - 1 ? (
                <span className="breadcrumb-current">{c.name}</span>
              ) : (
                <Link href={`/cartella/${c.id}`} className="breadcrumb">
                  {c.name}
                </Link>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <p>{items.length} elementi</p>
        </div>
        <div className="head-actions">
          <button
            className="new-folder-btn secondary"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            + Carica file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            style={{ display: "none" }}
          />
          <button
            className="new-folder-btn"
            type="button"
            onClick={() => setShowNewFolder((v) => !v)}
          >
            + Nuova cartella
          </button>
        </div>
      </div>

      {showNewFolder && (
        <form className="new-folder-form" onSubmit={createFolder}>
          <input
            autoFocus
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Nome della cartella"
          />
          <button type="submit">Crea</button>
        </form>
      )}

      {error && <p className="error-text">{error}</p>}

      <div className="grid">
        {items.map((item) =>
          item.type === "folder" ? (
            <div key={item.id} className="folder-card-wrap">
              <Link href={`/cartella/${item.id}`} className="folder-card">
                <FolderIcon />
                <p className="folder-name">{item.name}</p>
                <p className="folder-meta">Cartella</p>
              </Link>
              <button
                type="button"
                className="delete-btn"
                onClick={() => handleDelete(item.id, item.name)}
                aria-label={`Elimina ${item.name}`}
              >
                ×
              </button>
            </div>
          ) : (
            <div key={item.id} className="folder-card-wrap">
              <a
                href={`/api/files/download?id=${item.id}`}
                className="folder-card"
              >
                <FileIcon />
                <p className="folder-name">{item.name}</p>
                <p className="folder-meta">{formatSize(item.size)}</p>
              </a>
              <button
                type="button"
                className="delete-btn"
                onClick={() => handleDelete(item.id, item.name)}
                aria-label={`Elimina ${item.name}`}
              >
                ×
              </button>
            </div>
          )
        )}

        {items.length === 0 && (
          <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
            Questa cartella è vuota.
          </div>
        )}
      </div>
    </>
  );
}
