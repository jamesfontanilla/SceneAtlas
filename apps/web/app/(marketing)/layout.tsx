import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteHeader } from "@/components/chrome/site-header";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="sceneatlas-shell">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
