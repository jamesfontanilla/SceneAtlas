import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { publicNavigation, sceneAtlasBrand } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchAccount } from "@/lib/api";

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
            <UserButton />
          </>
        ) : (
          <>
            <SignInButton mode="modal">
              <Button variant="secondary" className="button--small">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="button--small">Create account</Button>
            </SignUpButton>
          </>
        )}
      </nav>
    </header>
  );
}

export default SiteHeader;
