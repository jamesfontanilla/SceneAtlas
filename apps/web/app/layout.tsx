import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { RouteAnalytics } from "@/components/analytics/route-analytics";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "SceneAtlas",
    template: "%s | SceneAtlas"
  },
  description:
    "SceneAtlas is a premium movie research SaaS with AI insights, spoiler controls, and a cinematic editorial UI."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="en">
      <head>
        {adsenseClientId ? (
          <script
            async
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          />
        ) : null}
      </head>
      <body>
        <Suspense fallback={null}>
          <RouteAnalytics />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
