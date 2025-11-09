import * as React from "react"

import { cn } from "@/lib/utils"

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "bg-gray-100 text-gray-900 hover:bg-gray-100/80",
    secondary: "bg-secondary/10 text-secondary hover:bg-secondary/20",
    success: "bg-success/10 text-success hover:bg-success/20",
    warning: "bg-warning/10 text-warning hover:bg-warning/20",
    danger: "bg-danger/10 text-danger hover:bg-danger/20",
    outline: "border border-gray-300 text-gray-900 hover:bg-gray-100",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
