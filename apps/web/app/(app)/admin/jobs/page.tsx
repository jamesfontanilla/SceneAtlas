import { fetchAdminExportJobs } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function AdminJobsPage() {
  const { exportJobs } = await fetchAdminExportJobs();

  return (
    <main className="app-flow">
      <SectionHeading
        eyebrow="Admin"
        title="Export jobs"
        copy="These jobs show what premium users exported and whether the payload is ready."
      />

      <Card className="analysis-card">
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>User</th>
                <th>Movie</th>
                <th>Format</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {exportJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.id.slice(0, 8)}</td>
                  <td>{job.userId}</td>
                  <td>{job.movieId ?? "All"}</td>
                  <td>{job.format}</td>
                  <td>
                    <Badge className={job.status === "ready" ? "chip--accent" : ""}>{job.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
