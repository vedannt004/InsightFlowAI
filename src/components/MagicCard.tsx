"use client";
import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

export function MagicCard({
  children,
  className,
  gradientSize = 250,
  gradientColor = "rgba(120, 119, 198, 0.3)",
  gradientOpacity = 0.8,
  ...props
}: MagicCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative flex size-full overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300",
        className
      )}
      {...props}
    >
      <div className="relative z-10 w-full h-full">{children}</div>
      
      {/* Background Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? gradientOpacity : 0,
          background: `radial-gradient(${gradientSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${gradientColor}, transparent 80%)`,
        }}
      />

      {/* Border Glow - Inside the container to avoid clipping by overflow-hidden */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${gradientSize / 1.5}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${gradientColor.replace(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d\.]+)?\)/, "rgba($1, $2, $3, 1)")}, transparent 100%)`,
          maskImage: "linear-gradient(white, white), linear-gradient(white, white)",
          maskClip: "content-box, border-box",
          maskComposite: "exclude",
          WebkitMaskComposite: "destination-out",
          padding: "2.5px", // Thickness of the glowing border
        }}
      />
    </div>
  );
}
