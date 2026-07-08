import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={["panel", className].filter(Boolean).join(" ")} {...props} />;
}
