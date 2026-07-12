import type { ChatMessageSnapshot } from "@/lib/api";
import { ChatMessage } from "./chat-message";

interface ChatThreadProps {
  messages: ChatMessageSnapshot[];
}

export function ChatThread({ messages }: ChatThreadProps) {
  if (!messages.length) {
    return (
      <div className="panel">
        <div className="panel__inner">
          <p className="muted" style={{ margin: 0 }}>
            Start the conversation by asking about the movie, its themes, or its ending.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-thread">
      {messages.map((message) => (
        <ChatMessage key={message.id} content={message.content} createdAt={message.createdAt} role={message.role} />
      ))}
    </div>
  );
}
