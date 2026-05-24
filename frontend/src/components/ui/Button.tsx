import Link from "next/link";

import { cn } from "@/lib/cn";



type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonSize = "sm" | "md" | "lg";



interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {

  variant?: ButtonVariant;

  size?: ButtonSize;

  href?: string;

}



const variants: Record<ButtonVariant, string> = {

  primary:

    "bg-accent text-white shadow-[0_0_24px_var(--glow)] hover:brightness-110",

  secondary:

    "border border-border bg-surface text-foreground backdrop-blur-sm hover:border-border hover:bg-surface-hover",

  ghost: "text-muted hover:bg-surface-hover hover:text-foreground",

  danger:

    "border border-error/30 bg-error text-white hover:brightness-110",

};



const sizes: Record<ButtonSize, string> = {

  sm: "min-h-10 rounded-xl px-3 py-2 text-xs",

  md: "min-h-10 rounded-2xl px-5 py-2.5 text-sm",

  lg: "min-h-11 rounded-2xl px-8 py-3 text-base",

};



export function Button({

  variant = "primary",

  size = "md",

  href,

  className,

  children,

  ...props

}: ButtonProps) {

  const classes = cn(

    "inline-flex items-center justify-center font-medium transition disabled:cursor-not-allowed disabled:opacity-60",

    variants[variant],

    sizes[size],

    className,

  );



  if (href) {

    return (

      <Link href={href} className={classes}>

        {children}

      </Link>

    );

  }



  return (

    <button type="button" className={classes} {...props}>

      {children}

    </button>

  );

}

