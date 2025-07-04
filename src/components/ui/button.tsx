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
        default: "",
        solid: "",
        "glass-premium": "",
        destructive: "",
        outline: "",
        secondary: "",
        ghost: "",
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
    const { currentTheme } = useThemeContext();
    const Comp = asChild ? Slot : "button"
    
    // Theme-aware variant classes
    const getVariantClasses = (variant: string | null | undefined) => {
      const isBlack = currentTheme === 'black';
      
      switch (variant) {
        case 'solid':
          if (isBlack) {
            return "bg-white text-black border border-white hover:bg-gray-100 shadow-lg hover:shadow-xl";
          }
          return "bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700 shadow-lg hover:shadow-xl";
            
        case 'default':
          if (isBlack) {
            return "bg-black text-white border border-white/20 hover:bg-gray-900 hover:border-white/30 shadow-lg hover:shadow-xl";
          }
          return "backdrop-blur-2xl bg-gradient-to-br from-blue-500/50 via-blue-600/40 to-indigo-600/45 text-white shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.15)_inset,0_1px_0_rgba(255,255,255,0.25)_inset,0_-1px_0_rgba(0,0,0,0.05)_inset] border border-white/15 hover:shadow-[0_16px_48px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,0.25)_inset,0_2px_0_rgba(255,255,255,0.35)_inset,0_-1px_0_rgba(0,0,0,0.08)_inset] hover:bg-gradient-to-br hover:from-blue-500/60 hover:via-blue-600/50 hover:to-indigo-600/55 hover:border-white/25 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:via-white/15 before:to-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-white/20 after:via-white/8 after:to-transparent after:pointer-events-none";
            
        case 'glass-premium':
          if (isBlack) {
            return "bg-black text-white border border-white/20 hover:bg-gray-900 hover:border-white/30 shadow-lg hover:shadow-xl";
          }
          return "backdrop-blur-2xl bg-gradient-to-br from-white/30 via-white/20 to-white/12 text-slate-900 shadow-[0_8px_40px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.4)_inset,0_1px_0_rgba(255,255,255,0.6)_inset,0_-1px_0_rgba(0,0,0,0.05)_inset] border border-white/20 hover:shadow-[0_16px_64px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,0.6)_inset,0_2px_0_rgba(255,255,255,0.8)_inset,0_-1px_0_rgba(0,0,0,0.08)_inset] hover:bg-gradient-to-br hover:from-white/40 hover:via-white/30 hover:to-white/18 hover:border-white/30 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/50 before:via-white/25 before:to-white/8 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-500 after:absolute after:top-0 after:left-1/4 after:right-1/4 after:h-[2px] after:bg-gradient-to-r after:from-transparent after:via-white/80 after:to-transparent after:rounded-full after:opacity-50 hover:after:opacity-100 after:transition-opacity after:duration-300";
            
        case 'destructive':
          if (isBlack) {
            return "bg-red-900 text-white border border-red-700 hover:bg-red-800 hover:border-red-600 shadow-lg hover:shadow-xl";
          }
          return "backdrop-blur-2xl bg-gradient-to-br from-red-500/50 via-red-600/40 to-red-700/45 text-white shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.15)_inset,0_1px_0_rgba(255,255,255,0.25)_inset,0_-1px_0_rgba(0,0,0,0.05)_inset] border border-white/15 hover:shadow-[0_16px_48px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,0.25)_inset,0_2px_0_rgba(255,255,255,0.35)_inset,0_-1px_0_rgba(0,0,0,0.08)_inset] hover:bg-gradient-to-br hover:from-red-500/60 hover:via-red-600/50 hover:to-red-700/55 hover:border-white/25 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:via-white/15 before:to-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-white/20 after:via-white/8 after:to-transparent after:pointer-events-none";
            
        case 'outline':
          if (isBlack) {
            return "bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white/40 shadow-lg hover:shadow-xl";
          }
          return "backdrop-blur-2xl bg-gradient-to-br from-white/20 via-white/15 to-white/8 text-slate-700 shadow-[0_8px_24px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.2)_inset,0_1px_0_rgba(255,255,255,0.3)_inset,0_-1px_0_rgba(0,0,0,0.03)_inset] border border-white/12 hover:bg-gradient-to-br hover:from-white/30 hover:via-white/25 hover:to-white/15 hover:text-slate-900 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.3)_inset,0_2px_0_rgba(255,255,255,0.4)_inset,0_-1px_0_rgba(0,0,0,0.05)_inset] hover:border-white/20 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/25 before:via-white/12 before:to-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-white/15 after:via-white/8 after:to-transparent after:pointer-events-none";
            
        case 'secondary':
          if (isBlack) {
            return "bg-gray-800 text-white border border-white/20 hover:bg-gray-700 hover:border-white/30 shadow-lg hover:shadow-xl";
          }
          return "backdrop-blur-2xl bg-gradient-to-br from-white/25 via-white/18 to-white/10 text-slate-700 shadow-[0_8px_24px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.25)_inset,0_1px_0_rgba(255,255,255,0.35)_inset,0_-1px_0_rgba(0,0,0,0.03)_inset] border border-white/15 hover:bg-gradient-to-br hover:from-white/35 hover:via-white/28 hover:to-white/18 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.35)_inset,0_2px_0_rgba(255,255,255,0.45)_inset,0_-1px_0_rgba(0,0,0,0.05)_inset] hover:border-white/25 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:via-white/15 before:to-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-white/18 after:via-white/10 after:to-transparent after:pointer-events-none";
            
        case 'ghost':
          if (isBlack) {
            return "bg-transparent text-white border border-white/10 hover:bg-white/10 hover:border-white/20 shadow-lg hover:shadow-xl";
          }
          return "backdrop-blur-2xl bg-gradient-to-br from-white/8 via-white/5 to-white/2 text-slate-700 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.1)_inset] border border-white/8 hover:bg-gradient-to-br hover:from-white/18 hover:via-white/12 hover:to-white/6 hover:text-slate-900 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.2)_inset,0_1px_0_rgba(255,255,255,0.25)_inset] hover:border-white/15 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-white/10 before:to-white/3 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500";
            
        default:
          return "";
      }
    };
    
    return (
      <Comp
        className={cn(
          buttonVariants({ size, className }),
          getVariantClasses(variant)
        )}
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
