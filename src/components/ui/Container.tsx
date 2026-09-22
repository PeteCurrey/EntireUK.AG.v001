import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "narrow" | "default" | "wide" | "full";
}

export function Container({ children, className = "", size = "default" }: ContainerProps) {
  const sizeClasses = {
    narrow: "max-w-4xl",
    default: "max-w-7xl",
    wide: "max-w-8xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`w-full mx-auto px-5 sm:px-8 lg:px-10 ${sizeClasses[size]} ${className}`}
    >
      {children}
    </div>
  );
}
