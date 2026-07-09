import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { resendVerificationAction, verifyEmailAction } from "@/lib/actions";

interface VerifyEmailPageProps {
  searchParams: Promise<{ email?: string; error?: string; message?: string; returnTo?: string }>;
}

function safeReturnTo(value?: string) {
  return value?.startsWith("/") ? value : "/search";
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const email = params.email?.trim() ?? "";
  const returnTo = safeReturnTo(params.returnTo);

  return (
    <Card className="auth-card">
      <div className="auth-grid">
        <div>
          <Badge className="chip--accent">Verify email</Badge>
          <h1 className="display-title section-title" style={{ marginTop: 14 }}>
            Enter your one-time code
          </h1>
          <p className="auth-copy">
            We sent a 6-digit code to your inbox. Once you verify it, SceneAtlas will sign you in automatically.
          </p>
          {email ? (
            <p className="auth-copy">
              Destination: <strong>{email}</strong>
            </p>
          ) : null}
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
          <form action={resendVerificationAction} className="auth-form" style={{ marginTop: 18 }}>
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <div className="auth-form__actions">
              <Button type="submit" variant="secondary" className="button--small">
                Resend code
              </Button>
              <Button href="/sign-in" variant="ghost" className="button--small">
                Back to sign in
              </Button>
            </div>
          </form>
        </div>

        <div className="auth-card panel--soft">
          <form action={verifyEmailAction} className="auth-form">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <label className="field">
              <span className="field__label">Verification code</span>
              <input className="field__input" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" required />
            </label>
            <div className="auth-form__actions">
              <Button type="submit">Verify and continue</Button>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
}
