import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

type CardTitleProps<T extends React.ElementType = "h3"> = {
  as?: T
} & React.ComponentPropsWithoutRef<T> & {
  className?: string
}

const CardTitle = React.forwardRef(
  <T extends React.ElementType = "h3">(
    { as, className, ...props }: CardTitleProps<T>,
    ref: React.Ref<React.ElementRef<T>>
  ) => {
    const Component = as || "h3"
    return (
      <Component
        ref={ref}
        className={cn("font-semibold leading-none tracking-tight", className)}
        {...props}
      />
    )
  }
)
CardTitle.displayName = "CardTitle"

type CardDescriptionProps<T extends React.ElementType = "p"> = {
  as?: T
} & React.ComponentPropsWithoutRef<T> & {
  className?: string
}

const CardDescription = React.forwardRef(
  <T extends React.ElementType = "p">(
    { as, className, ...props }: CardDescriptionProps<T>,
    ref: React.Ref<React.ElementRef<T>>
  ) => {
    const Component = as || "p"
    return (
      <Component
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    )
  }
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
