import { Bot, TrendingUp } from "lucide-react"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  }

  const textClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Bot className={`${sizeClasses[size]} text-bullish`} />
        <TrendingUp className={`absolute -bottom-1 -right-1 ${size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"} text-primary`} />
      </div>
      <span className={`${textClasses[size]} font-bold tracking-tight`}>
        AI<span className="text-bullish">Trade</span>Vision
      </span>
    </div>
  )
}
