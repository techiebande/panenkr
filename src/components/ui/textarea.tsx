import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-3 text-base",
        "placeholder:text-muted-foreground/60 placeholder:font-light",
        "transition-all duration-200 resize-none",
        "hover:border-input/60 hover:bg-background/80",
        "focus:border-ring focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-2 focus:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "selection:bg-primary/20 selection:text-foreground",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
