import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { startSignUpAction } from "@/lib/actions";

interface SignUpPageProps {
  searchParams: Promise<{ error?: string; message?: string; returnTo?: string }>;
}

function safeReturnTo(value?: string) {
  return value?.startsWith("/") ? value : "/search";
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);
  const googleHref = `/api/auth/google/start?${new URLSearchParams({ returnTo }).toString()}`;

  return (
    <Card className="auth-card">
      <div className="auth-grid">
        <div>
          <Badge className="chip--accent">Start free</Badge>
          <h1 className="display-title section-title" style={{ marginTop: 14 }}>
            Create your SceneAtlas account
          </h1>
          <p className="auth-copy">
            Sign up with email verification or Google. You'll receive a one-time code by email before the account becomes active.
          </p>
          {params.message ? (
            <p className="auth-copy" style={{ color: "var(--success)" }}>
              {params.message}
            </p>
          ) : null}
          {params.error ? (
            <p className="auth-copy auth-copy--error" style={{ color: "var(--danger)" }}>
              {params.error}
            </p>
          ) : null}
          <div className="auth-form__actions">
            <Button href={googleHref} variant="secondary" className="button--small">
              Continue with Google
            </Button>
            <Button href="/sign-in" variant="ghost" className="button--small">
              I already have an account
            </Button>
          </div>
        </div>

        <div className="auth-card panel--soft">
          <form action={startSignUpAction} className="auth-form">
            <input type="hidden" name="returnTo" value={returnTo} />
            <label className="field">
              <span className="field__label">Name</span>
              <input className="field__input" name="name" type="text" autoComplete="name" placeholder="Your display name" required />
            </label>
            <label className="field">
              <span className="field__label">Email</span>
              <input className="field__input" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
            </label>
            <label className="field">
              <span className="field__label">Password</span>
              <input className="field__input" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" required />
            </label>
            <label className="field">
              <span className="field__label">Confirm password</span>
              <input className="field__input" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat your password" required />
            </label>
            <div className="auth-form__actions">
              <Button type="submit">Create account</Button>
              <Button href="/sign-in" variant="secondary">
                Sign in instead
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
}
