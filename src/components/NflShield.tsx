/**
 * Real NFL shield image with inline SVG fallback so it never shows broken.
 */
export function NflShield({ className }: { className?: string }) {
  const realShieldUrl = 'https://static.cdnlogo.com/logos/n/56/nfl.svg';

  return (
    <span className="nfl-shield-wrapper" style={{ display: 'inline-block', position: 'relative' }}>
      <img
        src={realShieldUrl}
        alt="NFL"
        className={className}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'block';
        }}
        onLoad={(e) => {
          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'none';
        }}
      />
      <NflShieldFallback className={className} style={{ display: 'none' }} />
    </span>
  );
}

/**
 * Inline SVG fallback when the real NFL image fails to load.
 */
function NflShieldFallback({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 40 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M20 2L38 12v14c0 11-8 18-18 20S2 37 2 26V12L20 2z"
        fill="#013369"
      />
      <path
        d="M20 2v40c10-2 18-9 18-20V12L20 2z"
        fill="#D50A0A"
      />
      <path
        d="M20 10v28c-6-1.5-10-6-10-12V16l10-6z"
        fill="#fff"
        fillOpacity="0.9"
      />
      <path
        d="M20 10l10 6v10c0 6-4 10.5-10 12V10z"
        fill="#fff"
        fillOpacity="0.5"
      />
      <text
        x="20"
        y="30"
        textAnchor="middle"
        fill="#013369"
        fontSize="11"
        fontWeight="bold"
        fontFamily="system-ui, Arial, sans-serif"
      >
        NFL
      </text>
    </svg>
  );
}
