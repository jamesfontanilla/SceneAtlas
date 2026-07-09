import { fetchAccount, fetchUsage } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function SettingsPage() {
  const [account, usage] = await Promise.all([fetchAccount(), fetchUsage()]);

  return (
    <main className="app-flow">
      <SectionHeading
        eyebrow="Settings"
        title="System status and provider-ready plumbing"
        copy="SceneAtlas is built with separation between the UI, the API, and the underlying data providers."
      />

      <div className="settings-grid">
        <Card className="settings-card">
          <Badge className="chip--accent">Auth</Badge>
          <h3 className="settings-card__title">{account?.authProvider ?? "Email + Google"}</h3>
          <p className="settings-card__body">
            SceneAtlas now uses its own auth flow with email OTP, password reset emails, and Google OAuth.
          </p>
        </Card>
        <Card className="settings-card">
          <Badge>Account</Badge>
          <h3 className="settings-card__title">{account?.displayName ?? "Guest mode"}</h3>
          <p className="settings-card__body">
            {account ? account.email : "Sign in to keep your watchlist, collections, ratings, and reviews in sync."}
          </p>
        </Card>
        <Card className="settings-card">
          <Badge>Usage</Badge>
          <h3 className="settings-card__title">{usage.isPremium ? "Premium" : "Free"}</h3>
          <p className="settings-card__body">
            Searches left: {usage.isPremium ? "Unlimited" : usage.searchesRemaining}. Analyses left: {usage.isPremium ? "Unlimited" : usage.analysesRemaining}.
          </p>
        </Card>
        <Card className="settings-card">
          <Badge>Data model</Badge>
          <h3 className="settings-card__title">Wikidata + Commons baseline</h3>
          <p className="settings-card__body">Structured metadata and reusable media stay the public default, with the UI contract ready for later provider swaps.</p>
        </Card>
      </div>

      <div className="auth-grid">
        <Card className="analysis-card">
          <Badge className="chip--accent">Personal counters</Badge>
          <h3 className="analysis-card__title">What this account has saved</h3>
          <p className="analysis-card__body">
            Watchlist: {account?.watchlistCount ?? 0}. Collections: {account?.collectionCount ?? 0}. Ratings: {account?.ratingCount ?? 0}. Reviews:{" "}
            {account?.reviewCount ?? 0}.
          </p>
        </Card>
        <Card className="analysis-card">
          <Badge>Runtime</Badge>
          <h3 className="analysis-card__title">API-backed persistence</h3>
          <p className="analysis-card__body">
            The web tier stays stateless here, while the API owns sessions and can persist auth state through Neon.
          </p>
        </Card>
      </div>
    </main>
  );
}
