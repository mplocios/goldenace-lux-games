import { useMemo } from "react";

const PARTICLE_COUNT = 20;

export function GoldParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 12 + Math.random() * 18,
        delay: Math.random() * 15,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, oklch(0.9 0.17 95 / ${p.opacity}), oklch(0.82 0.16 86 / ${p.opacity * 0.5}))`,
            boxShadow: `0 0 ${p.size * 2}px oklch(0.82 0.16 86 / ${p.opacity * 0.4})`,
            animation: `float-up ${p.duration}s ${p.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}
