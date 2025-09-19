import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden tracking-wider uppercase",
  {
    variants: {
      variant: {
        default:
          "border border-primary/20 bg-primary text-primary-foreground shadow-sm [a&]:hover:shadow-md [a&]:hover:scale-105",
        secondary:
          "border border-secondary bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80 [a&]:hover:shadow-sm",
        destructive:
          "border border-destructive/20 bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 [a&]:hover:shadow-md",
        outline:
          "border-2 border-foreground/20 text-foreground [a&]:hover:bg-foreground/5 [a&]:hover:border-foreground/30",
        premium:
          "border border-accent/20 bg-gradient-to-r from-accent via-accent/90 to-accent text-accent-foreground font-bold shadow-md [a&]:hover:shadow-lg relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] [a&]:hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        luxury:
          "border border-primary/20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md [a&]:hover:shadow-lg [a&]:hover:scale-105",
        gold:
          "border border-accent/30 bg-accent text-accent-foreground shadow-md [a&]:hover:shadow-lg [a&]:hover:scale-105 font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
