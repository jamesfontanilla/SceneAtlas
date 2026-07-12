import { fetchProfile, fetchProfileChatSessions } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { ChatSessionList } from "@/features/chat/chat-session-list";

export default async function ProfileChatsPage() {
  const [profile, chatSessions] = await Promise.all([fetchProfile(), fetchProfileChatSessions()]);

  if (!profile) {
    return (
      <main className="app-flow">
        <Card className="analysis-card">
          <Badge className="chip--accent">Guest mode</Badge>
          <h3 className="analysis-card__title">Sign in to view your chats.</h3>
          <p className="analysis-card__body">Movie chat sessions are saved to your account so you can return to them later.</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="app-flow">
      <SectionHeading
        eyebrow="Chats"
        title="Saved movie conversations"
        copy="These sessions are resumable, movie-scoped, and trimmed so the assistant stays focused."
      />

      <div className="metric-grid">
        <div className="metric-card">
          <p className="metric-card__label">Chat sessions</p>
          <p className="metric-card__value">{chatSessions.sessions.length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Open sessions</p>
          <p className="metric-card__value">{chatSessions.sessions.filter((session) => !session.archived).length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Premium</p>
          <p className="metric-card__value">{profile.account.subscriptionTier}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Chat quota</p>
          <p className="metric-card__value">{profile.account.usage.isPremium ? "Unlimited" : profile.account.usage.chatMessagesRemaining ?? 0}</p>
        </div>
      </div>

      <ChatSessionList sessions={chatSessions.sessions} />
    </main>
  );
}
