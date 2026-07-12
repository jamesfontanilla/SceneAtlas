import { fetchAdminMetrics } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function AdminLogsPage() {
  const { metrics } = await fetchAdminMetrics();

  return (
    <main className="app-flow">
      <SectionHeading
        eyebrow="Admin"
        title="Recent operational logs"
        copy="These are the latest notable events recorded by the app so you can spot patterns quickly."
      />

      <Card className="analysis-card">
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kind</th>
                <th>Message</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {metrics.latestEvents.map((event) => (
                <tr key={event.id}>
                  <td>
                    <Badge className="chip--accent">{event.kind}</Badge>
                  </td>
                  <td>{event.message}</td>
                  <td>{new Date(event.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
