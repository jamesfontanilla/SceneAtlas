import { fetchAdminSubscriptions } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function AdminUsersPage() {
  const { subscriptions } = await fetchAdminSubscriptions();

  return (
    <main className="app-flow">
      <SectionHeading
        eyebrow="Admin"
        title="Subscription roster"
        copy="This list shows the current account roster with tier and billing state."
      />

      <Card className="analysis-card">
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Provider</th>
                <th>Tier</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td>{subscription.displayName}</td>
                  <td>{subscription.email}</td>
                  <td>{subscription.authProvider}</td>
                  <td>
                    <Badge className={subscription.tier === "PREMIUM" ? "chip--accent" : ""}>{subscription.tier}</Badge>
                  </td>
                  <td>{subscription.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
