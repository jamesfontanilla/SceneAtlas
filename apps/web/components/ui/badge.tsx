import type { HTMLAttributes } from "react";

export function Badge({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={["badge", className].filter(Boolean).join(" ")} {...props} />;
}
