import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { appNavigation, sceneAtlasBrand } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AccountSnapshot, UsageSnapshot } from "@sceneatlas/shared";

interface AppShellProps {
  children: React.ReactNode;
  usage: UsageSnapshot;
  account: AccountSnapshot | null;
}

export function AppShell({ children, usage, account }: AppShellProps) {
  const searchLabel = usage.isPremium ? "Unlimited" : `${usage.searchesRemaining} left today`;
  const analysisLabel = usage.isPremium ? "Unlimited" : `${usage.analysesRemaining} left`;

  return (
    <div className="sceneatlas-container sceneatlas-container--wide app-shell">
      <aside className="app-shell__sidebar">
        <div className="panel sidebar-card">
          <Link className="brand" href="/">
            <span className="brand__mark" aria-hidden="true" />
            <span>
              <p className="brand__name">{sceneAtlasBrand.name}</p>
              <p className="brand__tagline">Research desk</p>
            </span>
          </Link>
          <nav className="app-nav" aria-label="App">
            {appNavigation.map((item) => (
              <Link className="app-nav__link" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="panel sidebar-card sidebar-account">
          {account ? (
            <>
              <div className="sidebar-stat">
                <div>
                  <p className="sidebar-stat__label">Signed in as</p>
                  <p className="sidebar-stat__value">{account.displayName}</p>
                </div>
                <Badge className={account.subscriptionTier === "PREMIUM" ? "chip--accent" : ""}>{account.subscriptionTier}</Badge>
              </div>
              <p className="muted sidebar-account__email">{account.email}</p>
              <div className="detail__chips sidebar-account__chips">
                <Badge>{account.watchlistCount} saved</Badge>
                <Badge>{account.collectionCount} collections</Badge>
                <Badge>{account.reviewCount} reviews</Badge>
              </div>
            </>
          ) : (
            <>
              <p className="sidebar-stat__label">Guest mode</p>
              <h3 className="analysis-card__title">Sign in to keep your lists and reviews in sync.</h3>
              <p className="analysis-card__body">You can still search and browse, but saved state becomes personal once you sign in.</p>
              <div className="auth-form__actions">
                <SignInButton mode="modal">
                  <Button variant="secondary" className="button--small">
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="button--small">Create account</Button>
                </SignUpButton>
              </div>
            </>
          )}
        </div>

        <div className="panel sidebar-card sidebar-stats">
          <div className="sidebar-stat">
            <div>
              <p className="sidebar-stat__label">Free searches</p>
              <p className="sidebar-stat__value">{searchLabel}</p>
            </div>
            <Badge className={usage.adsEnabled ? "chip--accent" : ""}>{usage.adsEnabled ? "Ads on" : "Ad free"}</Badge>
          </div>
          <div className="sidebar-stat">
            <div>
              <p className="sidebar-stat__label">AI analyses</p>
              <p className="sidebar-stat__value">{analysisLabel}</p>
            </div>
            <Badge>{usage.isPremium ? "Premium" : "Free"}</Badge>
          </div>
          <Button href="/billing" variant="secondary" className="button--small">
            Upgrade access
          </Button>
        </div>
      </aside>

      <main className="app-shell__content">{children}</main>
    </div>
  );
}
