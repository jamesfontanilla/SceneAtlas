import { SignUp } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface SignUpPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;

  return (
    <Card className="auth-card">
      <div className="auth-grid">
        <div>
          <Badge className="chip--accent">Start free</Badge>
          <h1 className="display-title section-title" style={{ marginTop: 14 }}>
            Create your SceneAtlas account
          </h1>
          <p className="auth-copy">
            Clerk handles sign-up while SceneAtlas keeps your saved state and editorial browsing experience in sync.
          </p>
          {params.error ? (
            <p className="auth-copy auth-copy--error" style={{ color: "var(--danger)" }}>
              {params.error}
            </p>
          ) : null}
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <SignUp />
        </div>
      </div>
    </Card>
  );
}
