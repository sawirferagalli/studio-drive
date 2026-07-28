import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  return (
    <LoginForm
      initialNext={searchParams.next || "/"}
      initialError={!!searchParams.error}
    />
  );
}
