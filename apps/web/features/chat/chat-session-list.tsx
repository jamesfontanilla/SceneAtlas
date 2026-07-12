import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ChatSessionSnapshot } from "@/lib/api";

interface ChatSessionListProps {
  movieId?: string;
  sessions: ChatSessionSnapshot[];
  activeSessionId?: string;
}

export function ChatSessionList({ movieId, sessions, activeSessionId }: ChatSessionListProps) {
  if (!sessions.length) {
    return (
      <div className="panel">
        <div className="panel__inner">
          <Badge className="chip--accent">No sessions</Badge>
          <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
            Your saved movie chats will show up here once you start a thread.
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
            <th>Session</th>
            <th>Status</th>
            <th>Messages</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id}>
              <td>
                <Link href={`/movies/${movieId ?? session.movieId}/chat?sessionId=${session.id}`}>
                  {session.summary ? session.summary.slice(0, 60) : session.id.slice(0, 8)}
                </Link>
                {session.id === activeSessionId ? <Badge className="chip--accent" style={{ marginLeft: 8 }}>Active</Badge> : null}
              </td>
              <td>{session.archived ? "Archived" : "Open"}</td>
              <td>{session.messageCount ?? "0"}</td>
              <td>{new Date(session.lastMessageAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
