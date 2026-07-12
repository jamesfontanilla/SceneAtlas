import { notFound } from "next/navigation";
import { archiveChatSessionAction, startChatSessionAction } from "@/lib/actions";
import { fetchAccount, fetchChatSession, fetchChatSessions, fetchMovie } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { ChatComposer } from "@/features/chat/chat-composer";
import { ChatSessionList } from "@/features/chat/chat-session-list";
import { ChatThread } from "@/features/chat/chat-thread";

interface MovieChatPageProps {
  params: Promise<{ movieId: string }>;
  searchParams: Promise<{ sessionId?: string }>;
}

export default async function MovieChatPage({ params, searchParams }: MovieChatPageProps) {
  const { movieId } = await params;
  const query = await searchParams;
  const movie = await fetchMovie(movieId);

  if (!movie) {
    notFound();
  }

  const [account, sessionsResponse] = await Promise.all([fetchAccount(), fetchChatSessions(movieId)]);
  const activeSession = query.sessionId
    ? sessionsResponse.sessions.find((session) => session.id === query.sessionId) ?? null
    : sessionsResponse.sessions[0] ?? null;
  const activeSessionDetails = activeSession ? await fetchChatSession(activeSession.id) : null;

  return (
    <main className="app-flow">
      <SectionHeading
        eyebrow="AI chat"
        title={`Talk through ${movie.title}`}
        copy="A chat thread stays attached to this movie, so you can ask follow-up questions and come back to the same conversation later."
        action={<Button href={`/movies/${movie.slug}`}>Back to movie</Button>}
      />

      <div className="metric-grid">
        <div className="metric-card">
          <p className="metric-card__label">Sessions</p>
          <p className="metric-card__value">{sessionsResponse.sessions.length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Chat quota</p>
          <p className="metric-card__value">{account?.usage.isPremium ? "Unlimited" : account?.usage.chatMessagesRemaining ?? 0}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Spoilers</p>
          <p className="metric-card__value">{activeSession?.spoilerEnabled ? "On" : "Off"}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Model</p>
          <p className="metric-card__value">GPT OSS 120B</p>
        </div>
      </div>

      <div className="search-layout">
        <div className="chat-column">
          {activeSessionDetails ? (
            <Card className="analysis-card">
              <div className="detail__chips" style={{ marginBottom: 12 }}>
                <Badge className="chip--accent">{activeSessionDetails.session.archived ? "Archived" : "Open"}</Badge>
                <Badge>{activeSessionDetails.session.promptVersion}</Badge>
                <Badge>{activeSessionDetails.session.spoilerEnabled ? "Spoilers on" : "Spoilers off"}</Badge>
              </div>
              <h3 className="analysis-card__title">Session summary</h3>
              <p className="analysis-card__body">{activeSessionDetails.session.summary ?? "This session has not been summarized yet."}</p>
            </Card>
          ) : null}

          {activeSessionDetails ? (
            <ChatThread messages={activeSessionDetails.messages} />
          ) : (
            <Card className="analysis-card">
              <Badge className="chip--accent">New thread</Badge>
              <h3 className="analysis-card__title">Start a conversation about this title.</h3>
              <p className="analysis-card__body">Pick whether spoilers are allowed, then open a session and ask your first question.</p>
              <form action={startChatSessionAction} className="auth-form">
                <input type="hidden" name="movieId" value={movie.slug} />
                <label className="field field--inline">
                  <input name="spoilers" type="checkbox" value="true" />
                  <span className="field__label">Allow spoilers</span>
                </label>
                <Button type="submit">Start chat</Button>
              </form>
            </Card>
          )}

          {activeSessionDetails ? (
            <ChatComposer movieId={movie.slug} returnTo={`/movies/${movie.slug}/chat?sessionId=${activeSessionDetails.session.id}`} sessionId={activeSessionDetails.session.id} />
          ) : null}
        </div>

        <div className="search-side">
          <Card className="analysis-card">
            <Badge className="chip--accent">Movie sessions</Badge>
            <h3 className="analysis-card__title">{sessionsResponse.sessions.length} saved thread{sessionsResponse.sessions.length === 1 ? "" : "s"}</h3>
            <p className="analysis-card__body">Choose an existing session or create a new one if you want a fresh line of questioning.</p>
          </Card>

          <ChatSessionList activeSessionId={activeSessionDetails?.session.id} movieId={movie.slug} sessions={sessionsResponse.sessions} />

          {activeSessionDetails ? (
            <form action={archiveChatSessionAction} className="auth-form">
              <input type="hidden" name="sessionId" value={activeSessionDetails.session.id} />
              <input type="hidden" name="movieId" value={movie.slug} />
              <input type="hidden" name="returnTo" value={`/movies/${movie.slug}/chat`} />
              <Button type="submit" variant="secondary">
                Archive session
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </main>
  );
}
