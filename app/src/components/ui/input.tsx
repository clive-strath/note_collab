import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'paper' | 'ink' | 'sticky'
}

const inputVariants = {
  default: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  paper: "flex h-10 w-full bg-paper-100 border-b-2 border-ink-200 rounded-none px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-amber-400 focus:border-b-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-paper-50",
  ink: "flex h-10 w-full bg-ink-900 border border-ink-700 rounded-md px-3 py-2 text-sm text-paper-100 placeholder:text-ink-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-ink-800",
  sticky: "flex h-auto min-h-10 w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors resize-none disabled:cursor-not-allowed disabled:opacity-50",
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants[variant], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
