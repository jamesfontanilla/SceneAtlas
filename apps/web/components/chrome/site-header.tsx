import Link from "next/link";
import { publicNavigation, sceneAtlasBrand } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchAccount } from "@/lib/api";
import { signOutAction } from "@/lib/actions";

export async function SiteHeader() {
  const account = await fetchAccount();

  return (
    <header className="site-header sceneatlas-container sceneatlas-container--wide">
      <Link className="brand" href="/">
        <span className="brand__mark" aria-hidden="true" />
        <span>
          <p className="brand__name">{sceneAtlasBrand.name}</p>
          <p className="brand__tagline">{sceneAtlasBrand.shortTagline}</p>
        </span>
      </Link>

      <nav className="site-nav" aria-label="Primary">
        {publicNavigation.map((item) => (
          <Link className="site-nav__link" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
        {account ? (
          <>
            <Badge className={account.subscriptionTier === "PREMIUM" ? "chip--accent" : ""}>{account.displayName}</Badge>
            <Button href="/search" variant="secondary" className="button--small">
              Open app
            </Button>
            <form action={signOutAction} className="site-nav__form">
              <input type="hidden" name="returnTo" value="/" />
              <Button type="submit" variant="ghost" className="button--small">
                Sign out
              </Button>
            </form>
          </>
        ) : (
          <Button href="/sign-in" variant="secondary" className="button--small">
            Sign in
          </Button>
        )}
      </nav>
    </header>
  );
}

export default SiteHeader;
