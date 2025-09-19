import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-3 text-base",
        "placeholder:text-muted-foreground/60 placeholder:font-light",
        "transition-all duration-200",
        "hover:border-input/60 hover:bg-background/80",
        "focus:border-ring focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-2 focus:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "selection:bg-primary/20 selection:text-foreground",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
