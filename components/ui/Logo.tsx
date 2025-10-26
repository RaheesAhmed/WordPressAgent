"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "mini" | "full" | "compact";
  className?: string;
}

export function Logo({
  variant = "full",
  className,
}: LogoProps) {
  if (variant === "mini") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="wpAgent Icon"
        >
          <circle cx="18" cy="18" r="18" fill="#21759B" />
          <path
            d="M10 12L13.5 23L16.5 15L19.5 23L23 12"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="25" cy="13" r="2" fill="#10B981" />
        </svg>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="wpAgent Icon"
        >
          <circle cx="16" cy="16" r="16" fill="#21759B" />
          <path
            d="M9 11L12 20L14.5 13L17 20L20 11"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="22" cy="12" r="1.8" fill="#10B981" />
        </svg>
        <div className="flex items-baseline gap-0.5">
          <span className="text-lg font-bold text-[#21759B]">wp</span>
          <span className="text-lg font-bold text-foreground">Agent</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="wpAgent Logo"
      >
        <circle cx="22" cy="22" r="22" fill="#21759B" />
        <path
          d="M12 14L16.5 28L20 17L23.5 28L28 14"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="31" cy="16" r="2.5" fill="#10B981" />
      </svg>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[#21759B] leading-none tracking-tight">
          wp
        </span>
        <span className="text-2xl font-bold text-foreground leading-none tracking-tight">
          Agent
        </span>
      </div>
    </div>
  );
}

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
    <div className={cn("flex items-baseline gap-0.5", className)}>
      <span className={cn("font-bold text-[#21759B]", sizeClasses[size])}>
        wp
      </span>
      <span className={cn("font-bold text-foreground", sizeClasses[size])}>
        Agent
      </span>
    </div>
  );
}

export function LogoIcon({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="wpAgent Icon"
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
      <circle cx="22" cy="12" r="1.8" fill="#10B981" />
    </svg>
  );
}

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
      <circle cx="22" cy="12" r="1.8" fill="#10B981" />
    </svg>
  );
}
