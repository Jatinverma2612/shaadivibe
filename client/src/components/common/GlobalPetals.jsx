import React, { useMemo } from 'react';

/**
 * Autumn Leaves Silhouette Paths
 */
const MapleLeafIcon = ({ fill = '#E67A15', opacity = 0.85 }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Autumn Maple Leaf Silhouette with Veins */}
    <path
      d="M16 2 L17.5 7 L21 5 L20 9 L25 8 L22 13 L27 15 L22 17 L25 21 L19 19 L19 23 L16 20 L13 23 L13 19 L7 21 L10 17 L5 15 L10 13 L7 8 L12 9 L11 5 L14.5 7 Z"
      fill={fill}
      fillOpacity={opacity}
    />
    <path
      d="M16 20 L16 30"
      stroke={fill}
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity={opacity}
    />
    {/* Subtle Inner Vein Detail */}
    <path
      d="M16 7 L16 19 M16 12 L20 8 M16 12 L12 8 M16 16 L22 14 M16 16 L10 14"
      stroke="#FFF9F4"
      strokeWidth="0.6"
      strokeLinecap="round"
      opacity="0.35"
    />
  </svg>
);

const OakLeafIcon = ({ fill = '#C84B11', opacity = 0.85 }) => (
  <svg viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Autumn Oak Leaf Silhouette with rounded lobes */}
    <path
      d="M14 2 C16 4, 18 5, 20 4 C21 7, 23 8, 24 11 C22 13, 24 16, 23 19 C21 21, 23 24, 20 26 C18 27, 16 28, 14 28 C12 28, 10 27, 8 26 C5 24, 7 21, 5 19 C4 16, 6 13, 4 11 C5 8, 7 7, 8 4 C10 5, 12 4, 14 2 Z"
      fill={fill}
      fillOpacity={opacity}
    />
    <path
      d="M14 28 L14 33"
      stroke={fill}
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity={opacity}
    />
    <path
      d="M14 6 L14 27 M14 12 L19 10 M14 12 L9 10 M14 18 L19 16 M14 18 L9 16 M14 23 L18 22 M14 23 L10 22"
      stroke="#FFF9F4"
      strokeWidth="0.5"
      strokeLinecap="round"
      opacity="0.3"
    />
  </svg>
);

const BirchLeafIcon = ({ fill = '#F5BA13', opacity = 0.85 }) => (
  <svg viewBox="0 0 26 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Autumn Birch / Aspen Leaf Silhouette with serrated teardrop curve */}
    <path
      d="M13 2 C16 7, 23 13, 22 21 C21 26, 17 28, 13 28 C9 28, 5 26, 4 21 C3 13, 10 7, 13 2 Z"
      fill={fill}
      fillOpacity={opacity}
    />
    <path
      d="M13 28 L13 32"
      stroke={fill}
      strokeWidth="1.4"
      strokeLinecap="round"
      opacity={opacity}
    />
    <path
      d="M13 5 L13 27 M13 11 L18 9 M13 11 L8 9 M13 17 L19 15 M13 17 L7 15 M13 22 L17 21 M13 22 L9 21"
      stroke="#FFF9F4"
      strokeWidth="0.5"
      strokeLinecap="round"
      opacity="0.3"
    />
  </svg>
);

/**
 * Autumn Leaves Palette inspired by Autumn.jpg reference:
 * - Golden Yellow: #F5BA13, #F8C51C
 * - Warm Amber: #E67A15, #D97706
 * - Burnt Orange: #C84B11, #BD3D09
 * - Soft Ochre: #CC8E35, #B45309
 * - Muted Russet Brown: #8B4513, #78350F
 */
const LEAF_COLORS = [
  '#F5BA13', // Golden yellow
  '#E67A15', // Warm amber
  '#C84B11', // Burnt orange
  '#CC8E35', // Soft ochre
  '#8B4513', // Muted russet brown
  '#F8C51C', // Bright gold
  '#D97706', // Deep amber
  '#BD3D09', // Deep burnt orange
];

/**
 * Global Autumn Leaves for Public Website
 * Replaces pink petals with realistic golden, amber, and burnt orange leaves.
 * Continuous, non-intrusive drift behind interactive content with negative delays
 * so leaves are instantly visible across all heights of the viewport on page load.
 */
export const GlobalPetals = ({ count = 20 }) => {
  const leaves = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const color = LEAF_COLORS[i % LEAF_COLORS.length];
      const type = i % 3; // 0: Maple, 1: Oak, 2: Birch
      const animClass = i % 2 === 0 ? 'animate-autumn-leaf-1' : 'animate-autumn-leaf-2';
      const duration = (10 + (i % 6) * 1.8).toFixed(1); // 10s to 19s
      // Negative delays stagger the initial position so leaves are already across the screen
      const delay = (-((i * 1.3) % 15)).toFixed(1);
      const size = Math.floor(18 + (i % 5) * 3); // 18px to 30px
      const left = ((i * (100 / count) + ((i * 7) % 8) - 4)).toFixed(1);
      const rotation = Math.floor((i * 53) % 360);

      return {
        id: i,
        color,
        type,
        animClass,
        duration: `${duration}s`,
        delay: `${delay}s`,
        size,
        left: `${Math.max(2, Math.min(96, Number(left)))}%`,
        rotation,
      };
    });
  }, [count]);

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-[5] overflow-hidden"
      aria-hidden="true"
    >
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className={`absolute ${leaf.animClass} ${leaf.id >= 10 ? 'hidden sm:block' : ''}`}
          style={{
            left: leaf.left,
            top: '-40px',
            animationDuration: leaf.duration,
            animationDelay: leaf.delay,
            filter: 'drop-shadow(0 2px 4px rgba(73, 53, 47, 0.18))',
          }}
        >
          <div
            style={{
              width: `${leaf.size}px`,
              height: `${leaf.size * 1.15}px`,
              transform: `rotate(${leaf.rotation}deg)`,
            }}
          >
            {leaf.type === 0 && <MapleLeafIcon fill={leaf.color} opacity={0.88} />}
            {leaf.type === 1 && <OakLeafIcon fill={leaf.color} opacity={0.85} />}
            {leaf.type === 2 && <BirchLeafIcon fill={leaf.color} opacity={0.9} />}
          </div>
        </div>
      ))}
    </div>
  );
};
