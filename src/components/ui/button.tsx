import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[8px] text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer gap-1.5 select-none",
  {
    variants: {
      variant: {
        default:     "bg-[#D9A441] text-[#07111F] hover:bg-[#C4932E] shadow-sm font-semibold",
        destructive: "bg-[var(--destructive)] text-white hover:bg-red-600 shadow-sm",
        outline:     "border border-[var(--border)] bg-transparent hover:bg-[var(--bg-hover)] text-[var(--foreground)] transition-colors",
        secondary:   "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)] border border-[var(--border)] transition-colors",
        ghost:       "hover:bg-[var(--bg-hover)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
        link:        "text-[#D9A441] underline-offset-4 hover:underline p-0 h-auto",
        success:     "bg-[#22c55e] text-white hover:bg-green-600 shadow-sm",
      },
      size: {
        default: "h-9 px-3.5 py-2",
        sm:      "h-8 px-3 text-[12px]",
        lg:      "h-10 px-5 text-[14px]",
        icon:    "h-9 w-9",
        "icon-sm": "h-7 w-7 text-[12px]",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
