import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  copy?: string;
  action?: ReactNode;
}

export function SectionHeading({ eyebrow, title, copy, action }: SectionHeadingProps) {
  return (
    <div className="section__header">
      <div className="section__heading">
        <p className="eyebrow section__eyebrow">{eyebrow}</p>
        <h2 className="section__title">{title}</h2>
        {copy ? <p className="section__copy">{copy}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
