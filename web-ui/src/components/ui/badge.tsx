import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "success" | "warning" | "danger"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-800 text-slate-100 hover:bg-slate-700/80",
    outline: "text-slate-300 border border-slate-700",
    success: "bg-green-500/20 text-green-400 border border-green-500/20",
    warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20",
    danger: "bg-red-500/20 text-red-400 border border-red-500/20",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }