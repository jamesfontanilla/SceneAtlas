import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  fetchAdminExportJobs,
  fetchAdminFailures,
  fetchAdminMetrics,
  fetchAdminQueue,
  fetchAdminSubscriptions
} from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [metrics, queue, failures, exportJobs, subscriptions] = await Promise.all([
    fetchAdminMetrics(),
    fetchAdminQueue(),
    fetchAdminFailures(),
    fetchAdminExportJobs(),
    fetchAdminSubscriptions()
  ]);

  const summary = metrics.metrics;

  return (
    <main className="app-flow">
      <SectionHeading
        eyebrow="Admin"
        title="Operational control room"
        copy="This view is protected and intentionally boring in the best possible way: it shows the signals you need to keep the product healthy."
      />

      <div className="metric-grid">
        <div className="metric-card">
          <p className="metric-card__label">Users</p>
          <p className="metric-card__value">{summary.users}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Premium users</p>
          <p className="metric-card__value">{summary.premiumUsers}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Failed requests</p>
          <p className="metric-card__value">{summary.failedRequests}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Quota denials</p>
          <p className="metric-card__value">{summary.quotaDenials}</p>
        </div>
      </div>

      <div className="auth-grid">
        <Card className="analysis-card">
          <h3 className="analysis-card__title">Admin surfaces</h3>
          <p className="analysis-card__body">Jump directly to the specialized pages for users, analysis, jobs, logs, and cache operations.</p>
          <div className="auth-form__actions">
            <Button href="/admin/users" variant="secondary" className="button--small">
              Users
            </Button>
            <Button href="/admin/analysis" variant="secondary" className="button--small">
              Analysis
            </Button>
            <Button href="/admin/jobs" variant="secondary" className="button--small">
              Jobs
            </Button>
            <Button href="/admin/logs" variant="secondary" className="button--small">
              Logs
            </Button>
            <Button href="/admin/cache" variant="secondary" className="button--small">
              Cache
            </Button>
          </div>
        </Card>
      </div>

      <section className="section">
        <SectionHeading
          eyebrow="Usage"
          title="Daily usage buckets"
          copy="These are the live counters backing the free tier, premium toggle, and ad state."
        />
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Searches</th>
                <th>Analyses</th>
                <th>Exports</th>
                <th>Reviews</th>
                <th>Collections</th>
                <th>Tier</th>
              </tr>
            </thead>
            <tbody>
              {metrics.usageBuckets.map((bucket) => (
                <tr key={bucket.userId}>
                  <td>{bucket.displayName}</td>
                  <td>{bucket.email}</td>
                  <td>
                    {bucket.searchesUsed}/{bucket.searchesLimit}
                  </td>
                  <td>
                    {bucket.analysesUsed}/{bucket.analysesLimit}
                  </td>
                  <td>{bucket.exportUses}</td>
                  <td>{bucket.reviewsUsed}</td>
                  <td>{bucket.collectionCreates}</td>
                  <td>
                    <Badge className={bucket.isPremium ? "chip--accent" : ""}>{bucket.isPremium ? "Premium" : "Free"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <SectionHeading eyebrow="Analysis" title="Queue state" copy="Persistent analysis requests tell you what is ready, what failed, and what still needs attention." />
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Movie</th>
                <th>Spoilers</th>
                <th>Status</th>
                <th>Cached</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {queue.analysisRequests.map((item) => (
                <tr key={item.id}>
                  <td>{item.movieTitle}</td>
                  <td>{item.spoilerEnabled ? "On" : "Off"}</td>
                  <td>
                    <Badge className={item.status === "ready" ? "chip--accent" : ""}>{item.status}</Badge>
                  </td>
                  <td>{item.hasResult ? "Yes" : "No"}</td>
                  <td>{new Date(item.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Failures"
          title="Provider and search errors"
          copy="This is where you check whether movie lookups or AI generation need attention instead of guessing from user reports."
        />
        <div className="analysis-grid">
          {failures.failedRequests.length ? (
            failures.failedRequests.map((failure) => (
              <Card className="analysis-card" key={failure.id}>
                <div className="detail__chips" style={{ marginBottom: 12 }}>
                  <Badge className="chip--accent">{failure.kind}</Badge>
                  <Badge>{new Date(failure.createdAt).toLocaleDateString()}</Badge>
                </div>
                <h3 className="analysis-card__title">{failure.message}</h3>
                <p className="analysis-card__body">{failure.metadata ? JSON.stringify(failure.metadata) : "No metadata recorded."}</p>
              </Card>
            ))
          ) : (
            <Card className="analysis-card">
              <Badge className="chip--accent">Quiet</Badge>
              <h3 className="analysis-card__title">No failures recorded yet.</h3>
              <p className="analysis-card__body">That usually means the provider layer is behaving or the app is still early in its lifecycle.</p>
            </Card>
          )}
        </div>
      </section>

      <section className="section">
        <SectionHeading eyebrow="Exports" title="Premium export jobs" copy="These jobs show what users tried to export and whether the request completed." />
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>User</th>
                <th>Movie</th>
                <th>Format</th>
                <th>Status</th>
                <th>Payload</th>
              </tr>
            </thead>
            <tbody>
              {exportJobs.exportJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.id.slice(0, 8)}</td>
                  <td>{job.userId}</td>
                  <td>{job.movieId ?? "All"}</td>
                  <td>{job.format}</td>
                  <td>
                    <Badge className={job.status === "ready" ? "chip--accent" : ""}>{job.status}</Badge>
                  </td>
                  <td>{job.payloadSize} chars</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Subscriptions"
          title="Subscription state"
          copy="This is the current account roster with tier and billing status so you can spot odd patterns quickly."
        />
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Provider</th>
                <th>Tier</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td>{subscription.displayName}</td>
                  <td>{subscription.email}</td>
                  <td>{subscription.authProvider}</td>
                  <td>
                    <Badge className={subscription.tier === "PREMIUM" ? "chip--accent" : ""}>{subscription.tier}</Badge>
                  </td>
                  <td>{subscription.status}</td>
                  <td>{new Date(subscription.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
