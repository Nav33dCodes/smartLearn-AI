import React from "react";

export default function Logo({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0 }}
    >
      {/* Premium Minimalist Chat Bubble */}
      <path
        d="M4 7 C4 5.34315 5.34315 4 7 4 H17 C18.6569 4 20 5.34315 20 7 V15 C20 16.6569 18.6569 18 17 18 H8 L4 21 V7 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      
      {/* Sleek Geometric 'S' for SmartLearn */}
      <path
        d="M14.5 8 H11 A1.5 1.5 0 0 0 11 11 H13 A1.5 1.5 0 0 1 13 14 H9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}