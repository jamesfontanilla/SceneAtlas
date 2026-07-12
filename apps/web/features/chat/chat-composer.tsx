import { Button } from "@/components/ui/button";
import { sendChatMessageAction } from "@/lib/actions";

interface ChatComposerProps {
  sessionId: string;
  movieId: string;
  returnTo: string;
}

export function ChatComposer({ sessionId, movieId, returnTo }: ChatComposerProps) {
  return (
    <form action={sendChatMessageAction} className="auth-form chat-composer">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="movieId" value={movieId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <label className="field">
        <span className="field__label">Ask about this movie</span>
        <textarea className="field__input field__textarea" name="content" rows={4} placeholder="Why did the ending happen?" />
      </label>
      <Button type="submit">Send message</Button>
    </form>
  );
}
