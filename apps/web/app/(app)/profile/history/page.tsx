import { fetchProfile, fetchProfileHistory } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function ProfileHistoryPage() {
  const [profile, history] = await Promise.all([fetchProfile(), fetchProfileHistory()]);

  if (!profile) {
    return (
      <main className="app-flow">
        <Card className="analysis-card">
          <Badge className="chip--accent">Guest mode</Badge>
          <h3 className="analysis-card__title">Sign in to view your history.</h3>
          <p className="analysis-card__body">Recently viewed and analyzed movies are saved per account once you are signed in.</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="app-flow">
      <SectionHeading
        eyebrow="History"
        title="Recent views and analysis runs"
        copy="This is the part of the app that makes return visits feel effortless because the relevant titles are already waiting."
      />

      <div className="auth-grid">
        <Card className="analysis-card">
          <Badge className="chip--accent">Recently viewed</Badge>
          <h3 className="analysis-card__title">{history.views.length} title{history.views.length === 1 ? "" : "s"}</h3>
          <div className="panel" style={{ overflowX: "auto", marginTop: 16 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Spoilers</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {history.views.map((view) => (
                  <tr key={view.id}>
                    <td>{view.movieId}</td>
                    <td>{view.spoilerEnabled ? "On" : "Off"}</td>
                    <td>{new Date(view.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="analysis-card">
          <Badge className="chip--accent">Analysis history</Badge>
          <h3 className="analysis-card__title">{history.analyses.length} analysis request{history.analyses.length === 1 ? "" : "s"}</h3>
          <div className="panel" style={{ overflowX: "auto", marginTop: 16 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Event</th>
                  <th>Spoilers</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {history.analyses.map((analysis) => (
                  <tr key={`${analysis.eventName}-${analysis.createdAt}-${analysis.movieId}`}>
                    <td>{analysis.movieId}</td>
                    <td>{analysis.eventName}</td>
                    <td>{analysis.spoilers ? "On" : "Off"}</td>
                    <td>{new Date(analysis.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <section className="section">
        <SectionHeading eyebrow="Activity" title="The recent trail" copy="A compact activity feed makes it easy to jump back into the exact point you left off." />
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
              {history.recentActivity.map((item) => (
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
