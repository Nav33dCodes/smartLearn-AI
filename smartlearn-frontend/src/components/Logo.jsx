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
      {/* 1. Main Isometric Hexagon Base */}
      <path 
        d="M16 3 L27.26 9.5 L27.26 22.5 L16 29 L4.74 22.5 L4.74 9.5 Z" 
        fill="url(#sl_pro_grad)" 
      />
      
      {/* 2. Negative Space Lines - Carves the hexagon into 3 floating 3D panels */}
      <path 
        d="M16 16 V30 M16 16 L28.5 8.5 M16 16 L3.5 8.5" 
        stroke="var(--bg-main)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* 3. Central AI Core Node */}
      <circle cx="16" cy="16" r="4.5" fill="var(--bg-main)" />
      <circle cx="16" cy="16" r="2" fill="var(--text-primary)" />

      {/* Premium Tech Gradient (Emerald to Deep Blue) */}
      <defs>
        <linearGradient id="sl_pro_grad" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent-color)" />
          <stop offset="1" stopColor="#2563eb" /> 
        </linearGradient>
      </defs>
    </svg>
  );
}