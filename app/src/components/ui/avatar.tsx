import * as React from "react"
import { cn } from "@/lib/utils"

const avatarVariants = {
  default: "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
  paper: "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-paper-200 bg-paper-100 shadow-sm",
  ink: "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-ink-300 bg-ink-100 shadow-sm",
  sticky: "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 border-amber-200 bg-amber-50 shadow-sm",
  xl: "relative flex h-16 w-16 shrink-0 overflow-hidden rounded-full",
  lg: "relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full",
  sm: "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full",
}

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof avatarVariants; size?: keyof typeof avatarVariants }
>(({ className, variant = 'default', size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      avatarVariants[variant] || avatarVariants.default,
      size && avatarVariants[size],
      className
    )}
    {...props}
  />
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-ink-100 text-ink-600 font-medium font-caveat",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
