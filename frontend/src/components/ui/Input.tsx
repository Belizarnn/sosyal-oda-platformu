import { cn } from "@/lib/cn";



interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {

  label?: string;

}



export function Input({ label, className, id, ...props }: InputProps) {

  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");



  return (

    <div className="flex flex-col gap-1.5">

      {label ? (

        <label htmlFor={inputId} className="text-sm font-medium text-foreground/90">

          {label}

        </label>

      ) : null}

      <input

        id={inputId}

        className={cn(

          "min-h-11 w-full rounded-xl border border-border bg-input px-4 py-3 text-base text-foreground placeholder:text-muted/70 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-[var(--accent-ring)] sm:py-2.5 sm:text-sm",

          className,

        )}

        {...props}

      />

    </div>

  );

}

