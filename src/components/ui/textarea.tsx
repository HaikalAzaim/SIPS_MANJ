import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-[8px] px-3 py-2.5 text-[0.8125rem] outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 resize-none",
          className
        )}
        style={{
          background: 'var(--input)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          ...style,
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
