import type { MovieAnalysis, SimilarMovie } from "@sceneatlas/shared";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface InsightPanelProps {
  title: string;
  body: string;
}

export function InsightPanel({ title, body }: InsightPanelProps) {
  return (
    <section className="panel analysis-card">
      <h3 className="analysis-card__title">{title}</h3>
      <p className="analysis-card__body">{body}</p>
    </section>
  );
}

export function TimelineRail({ analysis }: { analysis: MovieAnalysis }) {
  return (
    <section className="timeline">
      {analysis.timeline.map((event) => (
        <article className="timeline-card panel" key={event.order}>
          <div>
            <p className="timeline-card__label">
              {event.label} {String(event.order).padStart(2, "0")}
            </p>
            <h3 className="timeline-card__title">{event.title}</h3>
          </div>
          <div>
            <p className="timeline-card__body">{event.description}</p>
            <div className="detail__chips" style={{ marginTop: 12 }}>
              {event.characters.map((character) => (
                <Badge key={character}>{character}</Badge>
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export function RelationshipMap({ analysis }: { analysis: MovieAnalysis }) {
  const relationships = analysis.relationships;
  if (!relationships.length) {
    return (
      <section className="panel relationship-map">
        <div className="panel__inner">
          <p className="muted" style={{ margin: 0 }}>
            Relationship data is not available yet for this title.
          </p>
        </div>
      </section>
    );
  }

  const nodes = Array.from(new Set(relationships.flatMap((edge) => [edge.source, edge.target])));
  const radius = 31;
  const center = { x: 50, y: 50 };
  const positions = nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index) / nodes.length - Math.PI / 2;
    return {
      node,
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    };
  });

  const pointFor = (name: string) => positions.find((item) => item.node === name) ?? positions[0];

  return (
    <section className="panel relationship-map">
      <svg className="relationship-map__svg" viewBox="0 0 100 100" role="img" aria-label="Character relationship map">
        {relationships.map((edge, index) => {
          const source = pointFor(edge.source);
          const target = pointFor(edge.target);
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;

          return (
            <g key={`${edge.source}-${edge.target}-${index}`}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="rgba(214, 176, 106, 0.55)"
                strokeWidth="0.7"
              />
              <text x={midX} y={midY - 1.5} fill="rgba(248, 243, 232, 0.72)" fontSize="3.2" textAnchor="middle">
                {edge.label}
              </text>
            </g>
          );
        })}

        {positions.map((position) => (
          <g key={position.node}>
            <circle cx={position.x} cy={position.y} r="6.1" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255,255,255,0.25)" />
            <circle cx={position.x} cy={position.y} r="3.1" fill="rgba(214, 176, 106, 0.85)" />
            <text x={position.x} y={position.y + 10.2} fill="rgba(248, 243, 232, 0.82)" fontSize="3.5" textAnchor="middle">
              {position.node}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}

export function SimilarMoviesGrid({ items }: { items: SimilarMovie[] }) {
  return (
    <div className="similar-grid">
      {items.map((item) => (
        <Link className="similar-card panel" href={`/movies/${item.slug}`} key={item.slug}>
          <div className="similar-card__title">
            <Badge className="chip--accent">{item.year}</Badge>
            <h3 style={{ marginTop: 12, marginBottom: 0 }}>{item.title}</h3>
          </div>
          <p className="similar-card__reason">{item.reason}</p>
        </Link>
      ))}
    </div>
  );
}
