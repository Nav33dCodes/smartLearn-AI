import React from "react";

export default function Logo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* 🔷 Glow Effect */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradient */}
        <linearGradient id="sl_pro_grad" x1="4" y1="3" x2="28" y2="29">
          <stop stopColor="var(--accent-color)" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      {/* 🔷 Main Hexagon */}
      <path
        d="M16 3 L27.26 9.5 L27.26 22.5 L16 29 L4.74 22.5 L4.74 9.5 Z"
        fill="url(#sl_pro_grad)"
        filter="url(#glow)"
      />

      {/* 🔷 Inner Lines (AI structure) */}
      <path
        d="M16 16 V30 M16 16 L28.5 8.5 M16 16 L3.5 8.5"
        stroke="var(--bg-main)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* 🔷 Core AI Node (Animated) */}
      <circle cx="16" cy="16" r="5" fill="var(--bg-main)" />

      <circle cx="16" cy="16" r="2.2" fill="var(--text-primary)">
        <animate
          attributeName="r"
          values="2;2.8;2"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* 🔷 Highlight (3D feel) */}
      <path
        d="M16 3 L27.26 9.5 L16 16 Z"
        fill="white"
        opacity="0.08"
      />
    </svg>
  );
}