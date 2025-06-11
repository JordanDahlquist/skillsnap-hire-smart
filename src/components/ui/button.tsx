
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-sm font-medium ring-offset-background transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-105 active:scale-95 overflow-hidden group",
  {
    variants: {
      variant: {
        default: "backdrop-blur-xl bg-gradient-to-br from-blue-500/60 via-blue-600/50 to-indigo-600/55 text-white shadow-2xl shadow-blue-500/40 border-2 border-white/40 hover:shadow-3xl hover:shadow-blue-500/50 hover:bg-gradient-to-br hover:from-blue-500/70 hover:via-blue-600/60 hover:to-indigo-600/65 hover:border-white/60 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:via-white/20 before:to-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-white/25 after:via-white/10 after:to-transparent after:pointer-events-none",
        "glass-premium": "backdrop-blur-2xl bg-gradient-to-br from-white/35 via-white/25 to-white/15 text-slate-900 shadow-[0_8px_40px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.6)_inset,0_1px_0_rgba(255,255,255,0.8)_inset,0_-1px_0_rgba(0,0,0,0.05)_inset] border-2 border-white/60 hover:shadow-[0_16px_64px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,0.8)_inset,0_2px_0_rgba(255,255,255,0.9)_inset,0_-1px_0_rgba(0,0,0,0.08)_inset] hover:bg-gradient-to-br hover:from-white/45 hover:via-white/35 hover:to-white/20 hover:border-white/80 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/60 before:via-white/30 before:to-white/10 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-500 after:absolute after:top-0 after:left-1/4 after:right-1/4 after:h-[2px] after:bg-gradient-to-r after:from-transparent after:via-white/90 after:to-transparent after:rounded-full after:opacity-60 hover:after:opacity-100 after:transition-opacity after:duration-300",
        destructive:
          "backdrop-blur-xl bg-gradient-to-br from-red-500/60 via-red-600/50 to-red-700/55 text-white shadow-2xl shadow-red-500/40 border-2 border-white/40 hover:shadow-3xl hover:shadow-red-500/50 hover:bg-gradient-to-br hover:from-red-500/70 hover:via-red-600/60 hover:to-red-700/65 hover:border-white/60 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:via-white/20 before:to-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-white/25 after:via-white/10 after:to-transparent after:pointer-events-none",
        outline:
          "backdrop-blur-xl border-2 border-white/50 bg-white/25 hover:bg-white/40 hover:shadow-2xl text-slate-700 hover:text-slate-900 shadow-lg shadow-black/10 hover:border-white/70 hover:shadow-white/20 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:via-white/15 before:to-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-white/20 after:via-white/10 after:to-transparent after:pointer-events-none",
        secondary:
          "backdrop-blur-xl bg-white/35 text-slate-700 border-2 border-white/45 hover:bg-white/50 hover:shadow-2xl shadow-lg shadow-black/10 hover:border-white/65 hover:shadow-white/20 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/35 before:via-white/20 before:to-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-white/20 after:via-white/10 after:to-transparent after:pointer-events-none",
        ghost: "backdrop-blur-xl hover:bg-white/25 hover:text-slate-900 hover:shadow-lg shadow-black/5 border-2 border-transparent hover:border-white/40 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:via-white/15 before:to-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 bg-transparent backdrop-blur-none shadow-none border-none",
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
