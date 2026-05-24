import { cn } from "@/lib/cn";



interface CardProps {

  children: React.ReactNode;

  className?: string;

  glow?: boolean;

}



export function Card({ children, className, glow = false }: CardProps) {

  return (

    <div

      className={cn(

        "rounded-2xl border border-border bg-card p-5 backdrop-blur-sm transition-colors",

        glow && "shadow-[0_0_40px_var(--glow)]",

        className,

      )}

    >

      {children}

    </div>

  );

}

