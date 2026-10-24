import React, { useMemo } from 'react';

export const FallingPetals = ({ count = 15 }) => {
  // Generate random trajectories and delays for petals
  const petals = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${(i * (100 / count) + Math.random() * 5).toFixed(1)}%`,
      animationDuration: `${(6 + Math.random() * 6).toFixed(1)}s`,
      animationDelay: `${(Math.random() * 5).toFixed(1)}s`,
      size: Math.floor(14 + Math.random() * 12),
      isMarigold: i % 3 === 0, // 1 in 3 is marigold orange, others are rose blush/maroon
      rotation: Math.floor(Math.random() * 360),
    }));
  }, [count]);

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-10 overflow-hidden"
      aria-hidden="true"
    >
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute animate-petal"
          style={{
            left: petal.left,
            top: '-30px',
            animationDuration: petal.animationDuration,
            animationDelay: petal.animationDelay,
          }}
        >
          <svg
            width={petal.size}
            height={petal.size * 1.3}
            viewBox="0 0 24 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: `rotate(${petal.rotation}deg)`,
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))',
            }}
          >
            {petal.isMarigold ? (
              // Marigold Petal
              <path
                d="M12 2 C18 6, 22 14, 20 24 C18 28, 14 30, 12 30 C10 30, 6 28, 4 24 C2 14, 6 6, 12 2 Z"
                fill="#E67A15"
                fillOpacity="0.75"
              />
            ) : (
              // Rose Petal
              <path
                d="M12 2 C19 8, 23 16, 19 25 C16 30, 12 30, 12 30 C12 30, 8 30, 5 25 C1 16, 5 8, 12 2 Z"
                fill="#8E1C37"
                fillOpacity="0.65"
              />
            )}
          </svg>
        </div>
      ))}
    </div>
  );
};
