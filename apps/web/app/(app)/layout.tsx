import { AppShell } from "@/components/chrome/app-shell";
import { fetchAccount, fetchUsage } from "@/lib/api";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [usage, account] = await Promise.all([fetchUsage(), fetchAccount()]);

  return (
    <div className="sceneatlas-shell">
      <AppShell account={account} usage={usage}>
        {children}
      </AppShell>
    </div>
  );
}
