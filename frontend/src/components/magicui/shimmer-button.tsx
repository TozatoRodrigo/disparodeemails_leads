import React from "react"
import { cn } from "@/lib/utils"

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#ff6b35",
      shimmerSize = "0.1em",
      shimmerDuration = "2s",
      borderRadius = "0.75rem",
      background = "linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 37, 133, 0.1))",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            "--shimmer-color": shimmerColor,
            "--shimmer-size": shimmerSize,
            "--shimmer-duration": shimmerDuration,
            "--border-radius": borderRadius,
            "--background": background,
          } as React.CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3",
          "text-white font-medium",
          "[background:var(--background)]",
          "[border-radius:var(--border-radius)]",
          "transform-gpu transition-all duration-300 ease-in-out",
          "hover:scale-[1.02] active:scale-[0.98]",
          "border border-zinc-700/50 hover:border-orange-500/50",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Shimmer effect */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "absolute inset-0 overflow-visible [container-type:size]"
          )}
        >
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--shimmer-spread)*.5)),transparent_0,var(--shimmer-color)_var(--shimmer-spread),transparent_var(--shimmer-spread))] [translate:0_0]" />
          </div>
        </div>
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>

        {/* Gradient overlay on hover */}
        <div
          className={cn(
            "absolute -z-20 [background:var(--background)]",
            "[border-radius:var(--border-radius)] [inset:var(--shimmer-size)]"
          )}
        />
      </button>
    )
  }
)

ShimmerButton.displayName = "ShimmerButton"

