import { redirect } from "next/navigation";
import { fetchAccount } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const account = await fetchAccount();

  if (!account) {
    redirect("/sign-in?returnTo=/admin");
  }

  if (!account.isAdmin) {
    redirect("/search");
  }

  return children;
}
