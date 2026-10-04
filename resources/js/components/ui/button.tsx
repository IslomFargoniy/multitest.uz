import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm dark:shadow-none hover:bg-primary/90 active:scale-[0.99]",
        destructive:
          "bg-destructive text-white shadow-sm dark:shadow-none hover:bg-destructive/90 active:scale-[0.99]",
        outline:
          "border border-border-strong bg-transparent text-foreground hover:bg-surface-2 active:scale-[0.99]",
        secondary:
          "bg-surface-2 border border-border-strong text-foreground hover:bg-secondary active:scale-[0.99]",
        ghost: "text-foreground hover:bg-surface-2",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-[18px] py-2 has-[>svg]:px-3.5",
        sm: "h-10 rounded-[10px] px-3.5 has-[>svg]:px-3 text-sm",
        lg: "h-12 rounded-[10px] px-6 has-[>svg]:px-4 text-base",
        icon: "size-10 rounded-[10px]",
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
