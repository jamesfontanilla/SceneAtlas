import { SignIn } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface SignInPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  return (
    <Card className="auth-card">
      <div className="auth-grid">
        <div>
          <Badge className="chip--accent">Welcome back</Badge>
          <h1 className="display-title section-title" style={{ marginTop: 14 }}>
            Sign in to SceneAtlas
          </h1>
          <p className="auth-copy">
            Use Clerk to access your watchlist, collections, ratings, and reviews across devices.
          </p>
          {params.error ? (
            <p className="auth-copy auth-copy--error" style={{ color: "var(--danger)" }}>
              {params.error}
            </p>
          ) : null}
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <SignIn />
        </div>
      </div>
    </Card>
  );
}
