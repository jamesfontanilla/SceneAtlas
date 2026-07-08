import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface BaseProps {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkButtonProps = BaseProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

function buttonClassName(variant: ButtonVariant, className = "") {
  return ["button", `button--${variant}`, className].filter(Boolean).join(" ");
}

export function Button(props: ButtonProps | LinkButtonProps) {
  const { variant = "primary", className = "", children } = props;
  const classes = buttonClassName(variant, className);

  if ("href" in props) {
    const { href, ...anchorProps } = props;
    return (
      <Link className={classes} href={href} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = props;
  return (
    <button className={classes} type={type} {...buttonProps}>
      {children}
    </button>
  );
}
