import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ChatSessionSnapshot } from "@/lib/api";

interface ChatPanelProps {
  movieId: string;
  sessions: ChatSessionSnapshot[];
  activeSession?: ChatSessionSnapshot | null;
}

export function ChatPanel({ movieId, sessions, activeSession }: ChatPanelProps) {
  return (
    <Card className="analysis-card">
      <div className="detail__chips" style={{ marginBottom: 12 }}>
        <Badge className="chip--accent">AI chat</Badge>
        <Badge>{sessions.length} session{sessions.length === 1 ? "" : "s"}</Badge>
      </div>
      <h3 className="analysis-card__title">Ask the movie desk a question</h3>
      <p className="analysis-card__body">
        Keep the conversation scoped to this title, resume past sessions, and revisit the thread later from your profile.
      </p>
      {activeSession ? (
        <p className="muted">Resume: {activeSession.summary ?? activeSession.id.slice(0, 8)}</p>
      ) : null}
      <div className="auth-form__actions">
        <Button href={`/movies/${movieId}/chat`} variant="secondary">
          Open chat
        </Button>
        {activeSession ? (
          <Button href={`/movies/${movieId}/chat?sessionId=${activeSession.id}`} variant="primary">
            Resume last session
          </Button>
        ) : null}
      </div>
      {sessions.length ? (
        <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
          Recent session count is shown in your <Link href="/profile/chats">chat history</Link>.
        </p>
      ) : null}
    </Card>
  );
}
