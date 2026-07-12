import { Card } from "@/components/ui/card";

export default function SearchLoading() {
  return (
    <main className="app-flow">
      <div className="panel panel--thin">
        <div className="panel__inner">
          <p className="eyebrow">SEARCH</p>
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--copy" />
        </div>
      </div>

      <div className="search-layout">
        <Card className="analysis-card">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--copy" />
          <div className="skeleton-grid" style={{ marginTop: 16 }}>
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
          </div>
        </Card>
      </div>
    </main>
  );
}
