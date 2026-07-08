import { sceneAtlasBrand } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer sceneatlas-container sceneatlas-container--wide">
      <p className="footer-note">
        {sceneAtlasBrand.name} is built for public SaaS deployment on Vercel, Render, and Neon.
      </p>
      <p className="footer-note">Wikidata + Wikimedia Commons baseline. Premium feel, restrained ads, no clutter.</p>
    </footer>
  );
}
