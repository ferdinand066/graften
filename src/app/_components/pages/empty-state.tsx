import * as React from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  children: React.ReactNode
  className?: string
}

function EmptyState({ children, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card border border-border shadow-lg p-8 text-center",
        className
      )}
    >
      {children}
    </div>
  )
}

function EmptyStateIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-muted-foreground mb-4 flex justify-center">
      {children}
    </div>
  )
}

function EmptyStateTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-card-foreground mb-2">
      {children}
    </h3>
  )
}

function EmptyStateDescription({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-sm mb-4">
      {children}
    </p>
  )
}

function EmptyStateAction({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-center">{children}</div>
}

export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
}
