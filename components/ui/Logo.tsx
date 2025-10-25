"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "mini" | "full" | "compact";
  className?: string;
  animate?: boolean;
}

export function Logo({
  variant = "full",
  className,
  animate = false,
}: LogoProps) {
  const animationClasses = animate
    ? "transition-all duration-300 hover:scale-105 active:scale-95"
    : "";

  if (variant === "mini") {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          animationClasses,
          className
        )}
      >
        <div className="relative group">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg transition-transform duration-300 group-hover:drop-shadow-xl"
          >
            {/* Glow effect background */}
            <circle
              cx="16"
              cy="16"
              r="15"
              fill="url(#glow-gradient)"
              opacity="0.2"
              className="transition-opacity duration-300 group-hover:opacity-30"
            />

            {/* Main circle - WordPress blue */}
            <circle
              cx="16"
              cy="16"
              r="16"
              fill="url(#gradient-bg-mini)"
              className="transition-all duration-300"
            />

            {/* WordPress W icon simplified */}
            <g className="transition-all duration-300">
              {/* W shape */}
              <path
                d="M9 11L12 21L14.5 14L17 21L20 11"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.95"
              />
              {/* AI indicator */}
              <circle cx="22" cy="12" r="2" fill="#00D4AA">
                <animate
                  attributeName="opacity"
                  values="1;0.5;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>

            <defs>
              <linearGradient
                id="gradient-bg-mini"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#21759B" />
                <stop offset="50%" stopColor="#1F6A8A" />
                <stop offset="100%" stopColor="#135E7C" />
              </linearGradient>
              <radialGradient id="glow-gradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#21759B" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn("flex items-center gap-2", animationClasses, className)}
      >
        {/* Compact Icon */}
        <div className="relative group">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-md transition-transform duration-300 group-hover:drop-shadow-lg"
          >
            <circle cx="14" cy="14" r="14" fill="url(#gradient-bg-compact)" />
            {/* W shape */}
            <path
              d="M8 10L10.5 18L12.5 12.5L14.5 18L17 10"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.95"
            />
            <circle cx="18.5" cy="11" r="1.5" fill="#00D4AA" />

            <defs>
              <linearGradient
                id="gradient-bg-compact"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#21759B" />
                <stop offset="100%" stopColor="#135E7C" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Compact Text */}
        <div className="flex items-baseline gap-0.5">
          <span className="text-lg font-bold bg-gradient-to-r from-[#21759B] to-[#135E7C] bg-clip-text text-transparent">
            wp
          </span>
          <span className="text-lg font-bold text-foreground">Agent</span>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn("flex items-center gap-3", animationClasses, className)}>
      {/* Enhanced Main Logo */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#21759B]/20 to-[#135E7C]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-110" />

        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative drop-shadow-lg transition-all duration-300 group-hover:drop-shadow-xl"
        >
          {/* Background circle with enhanced gradient */}
          <circle
            cx="20"
            cy="20"
            r="20"
            fill="url(#gradient-bg-full)"
            className="transition-all duration-300"
          />

          {/* Subtle inner shadow */}
          <circle
            cx="20"
            cy="20"
            r="19"
            fill="none"
            stroke="url(#inner-shadow)"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* WordPress W with AI enhancement */}
          <g className="transition-all duration-300 group-hover:scale-105">
            {/* Main W shape */}
            <path
              d="M11 14L15 26L18 17L21 26L25 14"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.95"
            />
            
            {/* AI sparkle indicators */}
            <circle cx="28" cy="15" r="2" fill="#00D4AA" opacity="0.9">
              <animate
                attributeName="opacity"
                values="0.9;0.5;0.9"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values="2;2.3;2"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="30" cy="20" r="1.2" fill="#00D4AA" opacity="0.7">
              <animate
                attributeName="opacity"
                values="0.7;0.3;0.7"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="28" cy="24" r="1.5" fill="#00D4AA" opacity="0.6">
              <animate
                attributeName="opacity"
                values="0.6;0.3;0.6"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          </g>

          <defs>
            <linearGradient
              id="gradient-bg-full"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#21759B" />
              <stop offset="50%" stopColor="#1F6A8A" />
              <stop offset="100%" stopColor="#135E7C" />
            </linearGradient>
            <linearGradient
              id="inner-shadow"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Enhanced Text Logo */}
      <div className="flex items-baseline gap-1 group">
        <span className="text-2xl font-bold bg-gradient-to-r from-[#21759B] to-[#135E7C] bg-clip-text text-transparent transition-all duration-300 group-hover:from-[#1F6A8A] group-hover:to-[#0F5268] leading-none">
          wp
        </span>
        <span className="text-2xl font-bold text-foreground transition-colors duration-300 group-hover:text-foreground/80 leading-none">
          Agent
        </span>
      </div>
    </div>
  );
}

// Enhanced TextLogo with better typography
export function TextLogo({
  className,
  size = "base",
}: {
  className?: string;
  size?: "sm" | "base" | "lg";
}) {
  const sizeClasses = {
    sm: "text-lg",
    base: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center gap-1 group", className)}>
      <span
        className={cn(
          "font-bold bg-gradient-to-r from-[#21759B] to-[#135E7C] bg-clip-text text-transparent transition-all duration-300 group-hover:from-[#1F6A8A] group-hover:to-[#0F5268]",
          sizeClasses[size]
        )}
      >
        wp
      </span>
      <span
        className={cn(
          "font-bold text-foreground transition-colors duration-300 group-hover:text-foreground/80",
          sizeClasses[size]
        )}
      >
        Agent
      </span>
    </div>
  );
}

// Enhanced LogoIcon with better visual effects
export function LogoIcon({
  size = 32,
  className,
  showGlow = false,
  animate = false,
}: {
  size?: number;
  className?: string;
  showGlow?: boolean;
  animate?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-center group", className)}>
      {showGlow && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#21759B]/30 to-[#135E7C]/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ transform: "scale(1.2)" }}
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "relative drop-shadow-lg transition-all duration-300 group-hover:drop-shadow-xl",
          animate && "hover:scale-105 active:scale-95"
        )}
      >
        <circle cx="16" cy="16" r="16" fill="url(#gradient-icon-enhanced)" />

        {/* WordPress W icon */}
        <g className="transition-all duration-300 group-hover:scale-105">
          <path
            d="M9 11L12 21L14.5 14L17 21L20 11"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.95"
          />
          <circle cx="22" cy="12" r="1.5" fill="#00D4AA">
            {animate && (
              <animate
                attributeName="opacity"
                values="1;0.5;1"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </g>

        <defs>
          <linearGradient
            id="gradient-icon-enhanced"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#21759B" />
            <stop offset="50%" stopColor="#1F6A8A" />
            <stop offset="100%" stopColor="#135E7C" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Loading animation
export function LogoLoading({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <LogoIcon size={size} animate={true} showGlow={true} />
    </div>
  );
}

// Favicon version
export function LogoFavicon({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="16" r="16" fill="#21759B" />
      <path
        d="M9 11L12 21L14.5 14L17 21L20 11"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="22" cy="12" r="1.5" fill="#00D4AA" />
    </svg>
  );
}
