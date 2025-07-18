
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { useThemeContext } from "@/contexts/ThemeContext"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-sm font-medium ring-offset-background transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-105 active:scale-95 overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl",
        solid: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl",
        "glass-premium": "backdrop-blur-2xl bg-gradient-to-br from-white/30 via-white/20 to-white/12 text-slate-900 shadow-[0_8px_40px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.4)_inset,0_1px_0_rgba(255,255,255,0.6)_inset,0_-1px_0_rgba(0,0,0,0.05)_inset] border border-white/20 hover:shadow-[0_16px_64px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,0.6)_inset,0_2px_0_rgba(255,255,255,0.8)_inset,0_-1px_0_rgba(0,0,0,0.08)_inset] hover:bg-gradient-to-br hover:from-white/40 hover:via-white/30 hover:to-white/18 hover:border-white/30",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-xl",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-lg hover:shadow-xl",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-lg hover:shadow-xl",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 bg-transparent backdrop-blur-none shadow-none border-none",
      },
      size: {
        default: "h-14 px-8 py-4 text-base",
        sm: "h-11 rounded-2xl px-6 text-sm",
        lg: "h-16 rounded-4xl px-10 py-5 text-lg font-semibold",
        icon: "h-14 w-14 rounded-3xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
