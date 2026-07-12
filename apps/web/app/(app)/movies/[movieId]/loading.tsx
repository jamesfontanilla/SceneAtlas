import { Card } from "@/components/ui/card";

export default function MovieLoading() {
  return (
    <main className="app-flow">
      <section className="detail">
        <Card className="analysis-card">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--copy" />
          <div className="skeleton-grid" style={{ marginTop: 16 }}>
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
          </div>
        </Card>
      </section>
    </main>
  );
}
