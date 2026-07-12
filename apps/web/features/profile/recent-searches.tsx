import { Badge } from "@/components/ui/badge";
import type { SearchEventSnapshot } from "@/lib/api";

interface RecentSearchesProps {
  searches: SearchEventSnapshot[];
}

export function RecentSearches({ searches }: RecentSearchesProps) {
  if (!searches.length) {
    return (
      <div className="panel">
        <div className="panel__inner">
          <Badge className="chip--accent">No searches yet</Badge>
          <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
            Your search history will appear here after you start exploring the catalog.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Query</th>
            <th>Results</th>
            <th>Provider</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {searches.map((search) => (
            <tr key={search.id}>
              <td>{search.query}</td>
              <td>{search.resultCount}</td>
              <td>{search.provider}</td>
              <td>{new Date(search.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
