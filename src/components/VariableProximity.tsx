"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface VariableProximityProps {
  label: string | string[];
  className?: string;
  fromWeight?: number;
  toWeight?: number;
  radius?: number;
}

export default function VariableProximity({
  label,
  className = "",
  fromWeight = 700,
  toWeight = 100,
  radius = 200,
}: VariableProximityProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Normalize label to an array of lines
  const lines = useMemo(() => (Array.isArray(label) ? label : [label]), [label]);

  return (
    <span ref={containerRef} className={cn("inline-flex flex-col items-center", className)}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="inline-block whitespace-nowrap">
          {line.split(" ").map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block whitespace-nowrap">
              {word.split("").map((char, charIndex) => (
                <Letter
                  key={charIndex}
                  char={char}
                  mousePos={mousePos}
                  containerRef={containerRef}
                  fromWeight={fromWeight}
                  toWeight={toWeight}
                  radius={radius}
                />
              ))}
              {wordIndex < line.split(" ").length - 1 && (
                <span className="inline-block">&nbsp;</span>
              )}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

interface LetterProps {
  char: string;
  mousePos: { x: number; y: number };
  containerRef: React.RefObject<HTMLSpanElement | null>;
  fromWeight: number;
  toWeight: number;
  radius: number;
}

function Letter({ char, mousePos, containerRef, fromWeight, toWeight, radius }: LetterProps) {
  const letterRef = useRef<HTMLSpanElement>(null);
  const weight = useSpring(fromWeight, {
    stiffness: 150,
    damping: 15,
  });

  useEffect(() => {
    if (!letterRef.current || !containerRef.current) return;
    const rect = letterRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Position of middle of letter relative to container
    const charX = rect.left - containerRect.left + rect.width / 2;
    const charY = rect.top - containerRect.top + rect.height / 2;

    const distance = Math.sqrt(
      Math.pow(mousePos.x - charX, 2) + Math.pow(mousePos.y - charY, 2)
    );

    if (distance < radius) {
      // Linear interpolation between fromWeight and toWeight based on distance
      const normalized = 1 - distance / radius;
      const targetWeight = fromWeight + (toWeight - fromWeight) * normalized;
      weight.set(targetWeight);
    } else {
      weight.set(fromWeight);
    }
  }, [mousePos, fromWeight, toWeight, radius, weight, containerRef]);

  // Use font-variation-settings for the variable proximity effect
  const fontVariationSettings = useTransform(weight, (v: number) => `'wght' ${Math.round(v)}`);

  return (
    <motion.span
      ref={letterRef}
      style={{
        display: "inline-block",
        fontVariationSettings: fontVariationSettings as any,
      }}
    >
      {char}
    </motion.span>
  );
}
