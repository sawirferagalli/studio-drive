export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  return (
    <div className="login-wrap">
      <h1>Accesso archivio</h1>
      <p>Inserisci la password condivisa dello studio.</p>
      {searchParams.error && (
        <p className="login-error">Password errata. Riprova.</p>
      )}
      <form action="/api/login" method="POST">
        <input type="hidden" name="next" value={searchParams.next || "/"} />
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
        />
        <button type="submit">Entra</button>
      </form>
    </div>
  );
}
