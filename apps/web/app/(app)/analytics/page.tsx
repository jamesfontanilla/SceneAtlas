import { fetchAnalyticsSummary, fetchProfile } from "@/lib/api";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function AnalyticsPage() {
  const profile = await fetchProfile();

  if (!profile) {
    return (
      <main className="app-flow">
        <Card className="analysis-card">
          <Badge className="chip--accent">Guest mode</Badge>
          <h3 className="analysis-card__title">Sign in to view your activity dashboard.</h3>
          <p className="analysis-card__body">The analytics page is most useful once your own searches, views, and chats have started to accumulate.</p>
        </Card>
      </main>
    );
  }

  if (!profile.account.isAdmin) {
    redirect("/search");
  }

  const analytics = await fetchAnalyticsSummary();

  return (
    <main className="app-flow">
      <SectionHeading
        eyebrow="Analytics"
        title="Product telemetry and personal activity"
        copy="The dashboard combines aggregate product signals with the current account's recent activity so the product can guide its next iteration."
      />

      <div className="metric-grid">
        <div className="metric-card">
          <p className="metric-card__label">Telemetry events</p>
          <p className="metric-card__value">{analytics.total}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Searches</p>
          <p className="metric-card__value">{analytics.byEventName.search_submission ?? 0}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Movie views</p>
          <p className="metric-card__value">{analytics.byEventName.movie_view ?? 0}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Chat messages</p>
          <p className="metric-card__value">{analytics.byEventName.chat_message ?? 0}</p>
        </div>
      </div>

      <div className="auth-grid">
        <Card className="analysis-card">
          <Badge className="chip--accent">Recent events</Badge>
          <div className="panel" style={{ overflowX: "auto", marginTop: 16 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>User</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.eventName}</td>
                    <td>{event.userId ?? "anonymous"}</td>
                    <td>{new Date(event.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="analysis-card">
          <Badge className="chip--accent">Account activity</Badge>
          <h3 className="analysis-card__title">{profile.account.displayName}</h3>
          <p className="analysis-card__body">
            Recent activity is already being recorded from searches, movie opens, chat sessions, watchlist saves, and collection changes.
          </p>
          <div className="detail__chips">
            <Badge>{profile.searchCount} searches</Badge>
            <Badge>{profile.viewCount} views</Badge>
            <Badge>{profile.chatSessionCount} chats</Badge>
          </div>
        </Card>
      </div>
    </main>
  );
}
