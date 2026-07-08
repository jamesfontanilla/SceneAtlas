import { downgradeAction, exportNotesAction, upgradeAction } from "@/lib/actions";
import { fetchAccount, fetchLatestExport, fetchUsage } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

interface BillingPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const params = await searchParams;
  const [account, usage, latestExport] = await Promise.all([fetchAccount(), fetchUsage(), fetchLatestExport()]);
  const isPremium = account?.usage.isPremium ?? usage.isPremium;

  return (
    <main className="app-flow">
      {params.error ? (
        <Card className="analysis-card">
          <Badge className="chip--accent">Action failed</Badge>
          <h3 className="analysis-card__title">Billing action could not complete.</h3>
          <p className="analysis-card__body">{params.error}</p>
        </Card>
      ) : null}

      <SectionHeading
        eyebrow="Billing"
        title="Upgrade for premium AI and an ad-free workspace"
        copy="Free users get a restrained ad-supported experience. Premium users get deeper analysis and no sponsor surfaces."
      />

      <div className="pricing-grid">
        <Card className="pricing-card">
          <Badge>Free</Badge>
          <p className="pricing-card__price">$0</p>
          <ul className="pricing-card__list">
            <li>Limited searches per day</li>
            <li>Limited AI analyses</li>
            <li>Native ad slots only</li>
            <li>Watchlist access</li>
          </ul>
          {isPremium ? (
            <form action={downgradeAction}>
              <input type="hidden" name="returnTo" value="/billing" />
              <Button type="submit" variant="secondary">
                Switch to free
              </Button>
            </form>
          ) : (
            <Button href="/search" variant="secondary">
              Current plan
            </Button>
          )}
        </Card>

        <Card className="pricing-card pricing-card--featured">
          <Badge className="chip--accent">Premium</Badge>
          <p className="pricing-card__price">$9</p>
          <ul className="pricing-card__list">
            <li>Premium AI analysis</li>
            <li>Export notes</li>
            <li>Unlimited collections</li>
            <li>Ad-free experience</li>
          </ul>
          {isPremium ? (
            <form action={downgradeAction}>
              <input type="hidden" name="returnTo" value="/billing" />
              <Button type="submit">Current premium plan</Button>
            </form>
          ) : (
            <form action={upgradeAction}>
              <input type="hidden" name="returnTo" value="/billing" />
              <Button type="submit">Upgrade now</Button>
            </form>
          )}
        </Card>
      </div>

      <div className="auth-grid">
        <Card className="analysis-card">
          <Badge className="chip--accent">Usage</Badge>
          <h3 className="analysis-card__title">Quota snapshot</h3>
          <p className="analysis-card__body">
            Searches left: {usage.isPremium ? "Unlimited" : usage.searchesRemaining}. Analyses left: {usage.isPremium ? "Unlimited" : usage.analysesRemaining}.
          </p>
        </Card>

        <Card className="analysis-card">
          <Badge>Export</Badge>
          <h3 className="analysis-card__title">Download your notes</h3>
          <p className="analysis-card__body">
            Exports are machine-friendly first, with JSON available for downstream tools and markdown for presentation.
          </p>
          <form action={exportNotesAction} className="auth-form">
            <input type="hidden" name="returnTo" value="/billing" />
            <label className="field">
              <span className="field__label">Format</span>
              <select className="field__select" defaultValue="json" name="format">
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
              </select>
            </label>
            <Button type="submit" variant={isPremium ? "primary" : "secondary"}>
              {isPremium ? "Export notes" : "Upgrade to export"}
            </Button>
          </form>
        </Card>
      </div>

      {latestExport ? (
        <Card className="analysis-card">
          <Badge className="chip--accent">Latest export</Badge>
          <h3 className="analysis-card__title">Generated {latestExport.format} bundle</h3>
          <p className="analysis-card__body">
            The latest export was created on {latestExport.createdAt} and is ready to use in downstream tools.
          </p>
        </Card>
      ) : (
        <Card className="analysis-card">
          <Badge>Ready when you are</Badge>
          <h3 className="analysis-card__title">No export jobs yet</h3>
          <p className="analysis-card__body">Once you create an export, the latest job will appear here for quick access.</p>
        </Card>
      )}
    </main>
  );
}
