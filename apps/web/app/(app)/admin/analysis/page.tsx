import { fetchAdminFailures, fetchAdminQueue } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function AdminAnalysisPage() {
  const [queue, failures] = await Promise.all([fetchAdminQueue(), fetchAdminFailures()]);

  return (
    <main className="app-flow">
      <SectionHeading
        eyebrow="Admin"
        title="Analysis queue and failures"
        copy="Use this view to see which movie analyses are queued, cached, or stuck."
      />

      <div className="auth-grid">
        <Card className="analysis-card">
          <Badge className="chip--accent">Queue</Badge>
          <div className="panel" style={{ overflowX: "auto", marginTop: 16 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Status</th>
                  <th>Cached</th>
                </tr>
              </thead>
              <tbody>
                {queue.analysisRequests.map((item) => (
                  <tr key={item.id}>
                    <td>{item.movieTitle}</td>
                    <td>{item.status}</td>
                    <td>{item.hasResult ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="analysis-card">
          <Badge className="chip--accent">Failures</Badge>
          <div className="panel" style={{ overflowX: "auto", marginTop: 16 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kind</th>
                  <th>Message</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {failures.failedRequests.map((failure) => (
                  <tr key={failure.id}>
                    <td>{failure.kind}</td>
                    <td>{failure.message}</td>
                    <td>{new Date(failure.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
