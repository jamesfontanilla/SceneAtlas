import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { forgotPasswordAction } from "@/lib/actions";

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string; message?: string; returnTo?: string }>;
}

function safeReturnTo(value?: string) {
  return value?.startsWith("/") ? value : "/search";
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);

  return (
    <Card className="auth-card">
      <div className="auth-grid">
        <div>
          <Badge className="chip--accent">Reset access</Badge>
          <h1 className="display-title section-title" style={{ marginTop: 14 }}>
            Forgot your password?
          </h1>
          <p className="auth-copy">
            Enter the email tied to your SceneAtlas account and we'll send a reset link through Brevo.
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
            <Button href="/sign-in" variant="secondary" className="button--small">
              Back to sign in
            </Button>
          </div>
        </div>

        <div className="auth-card panel--soft">
          <form action={forgotPasswordAction} className="auth-form">
            <input type="hidden" name="returnTo" value={returnTo} />
            <label className="field">
              <span className="field__label">Email</span>
              <input className="field__input" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
            </label>
            <div className="auth-form__actions">
              <Button type="submit">Send reset link</Button>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
}
