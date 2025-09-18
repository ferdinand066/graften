import * as React from "react"

type PageHeaderProps = {
  children: React.ReactNode
}

export function PageHeader({ children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      {children}
    </div>
  )
}

export function PageHeaderTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-3xl font-bold text-foreground">{children}</h2>
}

export function PageHeaderDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground mt-1">{children}</p>
}

export function PageHeaderContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function PageHeaderAction({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
