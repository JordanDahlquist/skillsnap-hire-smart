
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-sm font-medium ring-offset-background transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-105 active:scale-95 overflow-hidden group",
  {
    variants: {
      variant: {
        default: "backdrop-blur-xl bg-gradient-to-br from-blue-500/30 via-blue-600/25 to-indigo-600/30 text-white shadow-2xl shadow-blue-500/20 border border-white/20 hover:shadow-3xl hover:shadow-blue-500/30 hover:bg-gradient-to-br hover:from-blue-500/40 hover:via-blue-600/35 hover:to-indigo-600/40 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/25 before:via-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-white/15 after:via-transparent after:to-transparent after:pointer-events-none",
        destructive:
          "backdrop-blur-xl bg-gradient-to-br from-red-500/30 via-red-600/25 to-red-700/30 text-white shadow-2xl shadow-red-500/20 border border-white/20 hover:shadow-3xl hover:shadow-red-500/30 hover:bg-gradient-to-br hover:from-red-500/40 hover:via-red-600/35 hover:to-red-700/40 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/25 before:via-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-white/15 after:via-transparent after:to-transparent after:pointer-events-none",
        outline:
          "backdrop-blur-xl border-2 border-white/30 bg-white/15 hover:bg-white/25 hover:shadow-2xl text-slate-700 hover:text-slate-900 shadow-lg shadow-black/5 hover:border-white/40 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-white/10 after:via-transparent after:to-transparent after:pointer-events-none",
        secondary:
          "backdrop-blur-xl bg-white/20 text-slate-700 border border-white/25 hover:bg-white/30 hover:shadow-2xl shadow-lg shadow-black/5 hover:border-white/35 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/25 before:via-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-white/15 after:via-transparent after:to-transparent after:pointer-events-none",
        ghost: "backdrop-blur-xl hover:bg-white/15 hover:text-slate-900 hover:shadow-lg shadow-black/5 border border-transparent hover:border-white/20 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
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
