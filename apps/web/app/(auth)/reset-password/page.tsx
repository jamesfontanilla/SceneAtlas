import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { resetPasswordAction } from "@/lib/actions";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string; email?: string; error?: string; message?: string; returnTo?: string }>;
}

function safeReturnTo(value?: string) {
  return value?.startsWith("/") ? value : "/search";
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const email = params.email?.trim() ?? "";
  const returnTo = safeReturnTo(params.returnTo);

  return (
    <Card className="auth-card">
      <div className="auth-grid">
        <div>
          <Badge className="chip--accent">New password</Badge>
          <h1 className="display-title section-title" style={{ marginTop: 14 }}>
            Choose a new password
          </h1>
          <p className="auth-copy">Pick a fresh password and SceneAtlas will sign you back in immediately.</p>
          {email ? (
            <p className="auth-copy">
              Account: <strong>{email}</strong>
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
          {!token ? (
            <p className="auth-copy" style={{ color: "var(--danger)" }}>
              This page needs a valid reset link. If yours expired, request a new one from the sign-in page.
            </p>
          ) : null}
          <div className="auth-form__actions">
            <Button href="/forgot-password" variant="secondary" className="button--small">
              Request new link
            </Button>
            <Button href="/sign-in" variant="ghost" className="button--small">
              Back to sign in
            </Button>
          </div>
        </div>

        <div className="auth-card panel--soft">
          <form action={resetPasswordAction} className="auth-form">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <label className="field">
              <span className="field__label">New password</span>
              <input className="field__input" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" required />
            </label>
            <label className="field">
              <span className="field__label">Confirm password</span>
              <input className="field__input" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat the new password" required />
            </label>
            <div className="auth-form__actions">
              <Button type="submit" disabled={!token}>
                Update password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
}
