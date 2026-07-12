import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface SearchSuggestionsProps {
  suggestions: string[];
  query: string;
}

export function SearchSuggestions({ suggestions, query }: SearchSuggestionsProps) {
  if (!suggestions.length) {
    return null;
  }

  return (
    <div className="panel panel--thin">
      <div className="panel__inner">
        <p className="eyebrow">Search suggestions</p>
        <div className="detail__chips" style={{ marginTop: 12 }}>
          {suggestions.map((suggestion) => (
            <Link key={suggestion} href={`/search?q=${encodeURIComponent(suggestion)}`}>
              <Badge className={suggestion.toLowerCase() === query.trim().toLowerCase() ? "chip--accent" : ""}>{suggestion}</Badge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
