import Link from "next/link";

interface SpoilerToggleProps {
  slug: string;
  enabled: boolean;
}

export function SpoilerToggle({ slug, enabled }: SpoilerToggleProps) {
  const baseHref = `/movies/${slug}`;
  const spoilerHref = `${baseHref}?spoilers=1`;

  return (
    <div className="toggle" aria-label="Spoiler toggle">
      <Link className={["toggle__option", !enabled ? "toggle__option--active" : ""].filter(Boolean).join(" ")} href={baseHref}>
        Spoilers off
      </Link>
      <Link className={["toggle__option", enabled ? "toggle__option--active" : ""].filter(Boolean).join(" ")} href={spoilerHref}>
        Spoilers on
      </Link>
    </div>
  );
}
