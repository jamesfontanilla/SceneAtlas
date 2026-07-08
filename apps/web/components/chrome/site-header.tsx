import Link from "next/link";
import { publicNavigation, sceneAtlasBrand } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
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
        <Badge className="chip--accent">Public access</Badge>
        <Button href="/search" variant="secondary" className="button--small">
          Open app
        </Button>
        <Button href="/sign-in" variant="secondary" className="button--small">
          Sign in
        </Button>
        <Button href="/sign-up" className="button--small">
          Create account
        </Button>
      </nav>
    </header>
  );
}

export default SiteHeader;
