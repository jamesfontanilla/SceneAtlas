import { SiteHeader } from "@/components/chrome/site-header";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="sceneatlas-shell">
      <SiteHeader />
      <main className="auth-viewport sceneatlas-container">{children}</main>
    </div>
  );
}
