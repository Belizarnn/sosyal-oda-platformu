"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type ScrollRevealDirection = "up" | "down" | "left" | "right";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: ScrollRevealDirection;
  className?: string;
}

const hiddenTransforms: Record<ScrollRevealDirection, string> = {
  up: "translate-y-8",
  down: "-translate-y-8",
  left: "translate-x-8",
  right: "-translate-x-8",
};

const visibleTransform = "translate-x-0 translate-y-0";

export function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const node = ref.current;

    if (!node || reducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        reducedMotion
          ? "opacity-100"
          : visible
            ? cn("opacity-100", visibleTransform)
            : cn("opacity-0", hiddenTransforms[direction]),
        className,
      )}
      style={reducedMotion ? undefined : { transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export const landingGlassCardClass =
  "rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_0_40px_rgba(124,58,237,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/25 hover:shadow-[0_0_56px_rgba(167,139,250,0.18)]";

export const landingSectionClass = "mx-auto w-full max-w-6xl px-6 sm:px-10";
