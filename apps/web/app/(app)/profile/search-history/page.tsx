import { fetchProfile, fetchProfileSearchHistory } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { RecentSearches } from "@/features/profile/recent-searches";

export default async function ProfileSearchHistoryPage() {
  const [profile, searchHistory] = await Promise.all([fetchProfile(), fetchProfileSearchHistory()]);

  if (!profile) {
    return (
      <main className="app-flow">
        <Card className="analysis-card">
          <Badge className="chip--accent">Guest mode</Badge>
          <h3 className="analysis-card__title">Sign in to view your search history.</h3>
          <p className="analysis-card__body">Search history helps you return to the exact catalog queries you used before.</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="app-flow">
      <SectionHeading
        eyebrow="Search history"
        title="Recent catalog searches"
        copy="Search history is useful for returning to a movie idea even if the result page is gone."
      />

      <div className="metric-grid">
        <div className="metric-card">
          <p className="metric-card__label">Queries</p>
          <p className="metric-card__value">{searchHistory.searches.length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Last search</p>
          <p className="metric-card__value">
            {searchHistory.searches[0] ? new Date(searchHistory.searches[0].createdAt).toLocaleDateString() : "None"}
          </p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Watchlist</p>
          <p className="metric-card__value">{profile.account.watchlistCount}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Collections</p>
          <p className="metric-card__value">{profile.account.collectionCount}</p>
        </div>
      </div>

      <RecentSearches searches={searchHistory.searches} />
    </main>
  );
}
