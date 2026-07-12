import { Badge } from "@/components/ui/badge";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export function ChatMessage({ role, content, createdAt }: ChatMessageProps) {
  return (
    <article className={`chat-message chat-message--${role}`}>
      <div className="detail__chips" style={{ marginBottom: 8 }}>
        <Badge className={role === "assistant" ? "chip--accent" : ""}>{role}</Badge>
        <Badge>{new Date(createdAt).toLocaleString()}</Badge>
      </div>
      <p className="analysis-card__body" style={{ marginBottom: 0 }}>
        {content}
      </p>
    </article>
  );
}
