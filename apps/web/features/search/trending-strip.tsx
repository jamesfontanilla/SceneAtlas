import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { FeaturedQuerySnapshot } from "@/lib/api";

interface TrendingStripProps {
  items: FeaturedQuerySnapshot[];
}

export function TrendingStrip({ items }: TrendingStripProps) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="panel panel--thin">
      <div className="panel__inner">
        <p className="eyebrow">Trending now</p>
        <div className="detail__chips" style={{ marginTop: 12 }}>
          {items.map((item) => (
            <Link key={item.query} href={`/search?q=${encodeURIComponent(item.query)}`}>
              <Badge className="chip--accent">
                {item.query} <span className="muted">({item.count})</span>
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
