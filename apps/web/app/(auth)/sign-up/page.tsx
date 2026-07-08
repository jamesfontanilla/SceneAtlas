import { signUpAction } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SignUpPageProps {
  searchParams: Promise<{ returnTo?: string; error?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const returnTo = params.returnTo ?? "/search";

  return (
    <Card className="auth-card">
      <div className="auth-grid">
        <div>
          <Badge className="chip--accent">Start free</Badge>
          <h1 className="display-title section-title" style={{ marginTop: 14 }}>
            Create your SceneAtlas account
          </h1>
          <p className="auth-copy">
            Use the free tier to search movies, then upgrade for premium AI analysis, export notes, and unlimited collections.
          </p>
          {params.error ? (
            <p className="auth-copy auth-copy--error" style={{ color: "var(--danger)" }}>
              {params.error}
            </p>
          ) : null}
        </div>

        <form className="auth-form" action={signUpAction}>
          <input type="hidden" name="returnTo" value={returnTo} />
          <label className="field">
            <span className="field__label">Name</span>
            <input className="field__input" name="name" placeholder="Your name" />
          </label>
          <label className="field">
            <span className="field__label">Email</span>
            <input className="field__input" name="email" type="email" placeholder="you@example.com" />
          </label>
          <label className="field">
            <span className="field__label">Avatar URL</span>
            <input className="field__input" name="avatar" placeholder="https://example.com/avatar.png" />
          </label>
          <label className="field">
            <span className="field__label">Provider</span>
            <select className="field__select" defaultValue="authjs" name="provider">
              <option value="authjs">Auth.js</option>
              <option value="clerk">Clerk</option>
            </select>
          </label>
          <div className="auth-form__actions">
            <Button type="submit">Create account</Button>
            <Button href="/sign-in" variant="secondary">
              I already have an account
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
