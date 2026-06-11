import React from "react";

export default function Logo({ size = 32, className = "" }) {
  return (
    <img
      src="/images/logo.svg"
      alt="SmartLearn Logo"
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0, objectFit: 'contain' }}
      onError={(e) => {
        // Fallback styling if the user hasn't added the image yet
        e.target.style.display = 'none';
      }}
    />
  );
}