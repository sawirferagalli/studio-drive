"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const LoginTransition3D = dynamic(
  () => import("@/components/LoginTransition3D"),
  { ssr: false }
);

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

export default function LoginForm({
  initialNext,
  initialError,
}: {
  initialNext: string;
  initialError: boolean;
}) {
  const [error, setError] = useState(initialError);
  const [pending, setPending] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);
    setPending(true);

    const formData = new FormData(e.currentTarget);

    let res: Response;
    try {
      res = await fetch("/api/login", { method: "POST", body: formData });
    } catch {
      setError(true);
      setPending(false);
      return;
    }

    const destination = new URL(res.url);
    if (destination.pathname === "/login") {
      setError(true);
      setPending(false);
      return;
    }

    const target = destination.pathname + destination.search;

    if (supportsWebGL()) {
      setTransitionTarget(target);
    } else {
      window.location.assign(target);
    }
  }

  if (transitionTarget) {
    return (
      <LoginTransition3D onComplete={() => window.location.assign(transitionTarget)} />
    );
  }

  return (
    <div className="login-wrap">
      <h1>Accesso archivio</h1>
      <p>Inserisci la password condivisa dello studio.</p>
      {error && <p className="login-error">Password errata. Riprova.</p>}
      <form action="/api/login" method="POST" onSubmit={handleSubmit}>
        <input type="hidden" name="next" value={initialNext} />
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          disabled={pending}
        />
        <button type="submit" disabled={pending}>
          Entra
        </button>
      </form>
    </div>
  );
}
