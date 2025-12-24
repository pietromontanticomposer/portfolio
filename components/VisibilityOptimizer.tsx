"use client";
import { useEffect, useRef, useState, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
};

export default function VisibilityOptimizer({
  children,
  fallback = null,
  rootMargin = '200px'
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            // Once visible, keep it rendered
            observer.disconnect();
          }
        });
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
}
