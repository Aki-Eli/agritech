import React from 'react';

/**
 * AgriLogo — SVG mark for Agri-Tech.
 *
 * A stylised leaf whose central vein branches into circuit-board traces,
 * blending organic farming with precision technology.
 *
 * Props:
 *   size   — pixel size of the square viewBox (default 32)
 *   color  — primary fill / stroke colour (default 'currentColor')
 *   style  — extra inline styles on the <svg>
 */
const AgriLogo = ({ size = 32, color = 'currentColor', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Agri-Tech logo"
    style={style}
  >
    {/* ── Leaf body ── */}
    <path
      d="M20 4
         C20 4 8 10 8 22
         C8 30 14 36 20 36
         C26 36 32 30 32 22
         C32 10 20 4 20 4Z"
      fill={color}
      opacity="0.15"
    />
    <path
      d="M20 4
         C20 4 8 10 8 22
         C8 30 14 36 20 36
         C26 36 32 30 32 22
         C32 10 20 4 20 4Z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill="none"
    />

    {/* ── Central vein (stem) ── */}
    <line
      x1="20" y1="36"
      x2="20" y2="10"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    {/* ── Left circuit branch ── */}
    {/* horizontal trace */}
    <line x1="20" y1="22" x2="13" y2="22" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    {/* vertical trace up */}
    <line x1="13" y1="22" x2="13" y2="17" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    {/* node dot */}
    <circle cx="13" cy="17" r="1.4" fill={color} />

    {/* ── Right circuit branch ── */}
    <line x1="20" y1="27" x2="27" y2="27" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <line x1="27" y1="27" x2="27" y2="22" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="27" cy="22" r="1.4" fill={color} />

    {/* ── Small top node on stem ── */}
    <circle cx="20" cy="14" r="1.4" fill={color} />
  </svg>
);

export default AgriLogo;
