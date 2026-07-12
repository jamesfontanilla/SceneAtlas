import { updateProfileAction } from "@/lib/actions";
import { fetchProfile, fetchUsage } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function ProfilePage() {
  const [profile, usage] = await Promise.all([fetchProfile(), fetchUsage()]);

  if (!profile) {
    return (
      <main className="app-flow">
        <Card className="analysis-card">
          <Badge className="chip--accent">Guest mode</Badge>
          <h3 className="analysis-card__title">Sign in to unlock your profile.</h3>
          <p className="analysis-card__body">Your saved work, activity, and chat sessions will live here once you have an account.</p>
          <Button href="/sign-in" variant="secondary">
            Sign in
          </Button>
        </Card>
      </main>
    );
  }

  const account = profile.account;

  return (
    <main className="app-flow">
      <SectionHeading
        eyebrow="Profile"
        title="Your SceneAtlas identity"
        copy="This view surfaces the saved work, usage snapshot, and lightweight account settings that make the product feel personal."
      />

      <div className="metric-grid">
        <div className="metric-card">
          <p className="metric-card__label">Display name</p>
          <p className="metric-card__value">{account.displayName}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Joined</p>
          <p className="metric-card__value">{profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : "Unknown"}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Subscription</p>
          <p className="metric-card__value">{account.subscriptionTier}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Chat quota</p>
          <p className="metric-card__value">{usage.isPremium ? "Unlimited" : `${usage.chatMessagesRemaining ?? 0} left`}</p>
        </div>
      </div>

      <div className="auth-grid">
        <Card className="analysis-card">
          <Badge className="chip--accent">Account</Badge>
          <h3 className="analysis-card__title">{account.displayName}</h3>
          <p className="analysis-card__body">{account.email}</p>
          <div className="detail__chips">
            <Badge>{account.watchlistCount} watchlist</Badge>
            <Badge>{account.collectionCount} collections</Badge>
            <Badge>{account.reviewCount} reviews</Badge>
            <Badge>{profile.chatSessionCount} chats</Badge>
          </div>
        </Card>

        <Card className="analysis-card">
          <Badge className="chip--accent">Edit profile</Badge>
          <form action={updateProfileAction} className="auth-form" style={{ marginTop: 16 }}>
            <label className="field">
              <span className="field__label">Display name</span>
              <input className="field__input" defaultValue={account.displayName} name="displayName" />
            </label>
            <label className="field">
              <span className="field__label">Avatar URL</span>
              <input className="field__input" defaultValue={account.avatar ?? ""} name="avatar" placeholder="https://..." />
            </label>
            <Button type="submit">Save profile</Button>
          </form>
        </Card>
      </div>

      <section className="section">
        <SectionHeading
          eyebrow="Activity"
          title="What you have been doing lately"
          copy="Recent activity should be easy to scan so users can jump back into the exact part of the product they left off."
        />
        <div className="panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Detail</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {profile.recentActivity.map((item) => (
                <tr key={`${item.kind}-${item.createdAt}-${item.title}`}>
                  <td>{item.kind}</td>
                  <td>{item.title}</td>
                  <td>{item.detail}</td>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
