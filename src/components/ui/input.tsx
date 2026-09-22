import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-[8px] px-3 py-1.5 text-[13px] outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        style={{
          background: 'var(--input)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        } as React.CSSProperties}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
