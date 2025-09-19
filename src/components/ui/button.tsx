import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:translate-y-px",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md active:translate-y-px",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-foreground/5 active:translate-y-px",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 active:translate-y-px",
        ghost:
          "hover:bg-foreground/5 hover:text-foreground active:bg-foreground/10",
        link: "text-foreground underline-offset-4 hover:underline hover:text-accent font-normal",
        luxury:
          "bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-md hover:shadow-lg active:translate-y-px border border-primary/20",
        gold:
          "bg-accent text-accent-foreground shadow-md hover:shadow-lg active:translate-y-px relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
      },
      size: {
        default: "h-12 px-6 py-3 text-base rounded-xl has-[>svg]:px-5",
        sm: "h-10 px-4 py-2 text-sm rounded-lg gap-1.5 has-[>svg]:px-3.5",
        lg: "h-14 px-8 py-4 text-lg rounded-xl has-[>svg]:px-6",
        xl: "h-16 px-10 py-5 text-xl rounded-2xl has-[>svg]:px-8",
        icon: "size-12 rounded-xl",
        "icon-sm": "size-10 rounded-lg",
        "icon-lg": "size-14 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
