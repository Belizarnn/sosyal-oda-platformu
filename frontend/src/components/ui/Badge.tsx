import { cn } from "@/lib/cn";



interface BadgeProps {

  children: React.ReactNode;

  className?: string;

  variant?: "default" | "accent" | "muted";

}



const variants = {

  default: "border-border bg-surface text-foreground/90",

  accent: "border-accent/30 bg-accent-soft text-accent",

  muted: "border-border bg-transparent text-muted",

};



export function Badge({

  children,

  className,

  variant = "default",

}: BadgeProps) {

  return (

    <span

      className={cn(

        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",

        variants[variant],

        className,

      )}

    >

      {children}

    </span>

  );

}

