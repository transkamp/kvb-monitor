"use client";

type Props = {
  size?: number;
  className?: string;
};

export default function EmptyDeparturesIllustration({
  size = 160,
  className,
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label="Keine Abfahrten gefunden"
      className={className}
    >
      <style>{`
        .es-pole      { stroke: var(--secondary); }
        .es-sign-bg   { fill: var(--surface); stroke: var(--secondary); }
        .es-sign-h    { fill: #B45309; }
        .es-sign-line { stroke: var(--secondary); }
        .es-cloud     { fill: var(--secondary); opacity: 0.18; }
        .es-ground    { stroke: var(--secondary); opacity: 0.35; }

        @keyframes es-sway {
          0%, 100% { transform: rotate(-2deg); }
          50%      { transform: rotate(2deg); }
        }
        @keyframes es-cloud-drift {
          0%   { transform: translateX(-30px); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(150px); opacity: 0; }
        }
        @keyframes es-cloud-drift-2 {
          0%   { transform: translateX(-50px); opacity: 0; }
          20%  { opacity: 0.8; }
          80%  { opacity: 0.8; }
          100% { transform: translateX(160px); opacity: 0; }
        }
        .es-sign-group {
          transform-origin: 60px 32px;
          transform-box: fill-box;
          animation: es-sway 4s ease-in-out infinite;
        }
        .es-cloud-1 { animation: es-cloud-drift   9s  linear infinite; }
        .es-cloud-2 { animation: es-cloud-drift-2 12s linear infinite; animation-delay: -4s; }

        @media (prefers-reduced-motion: reduce) {
          .es-sign-group, .es-cloud-1, .es-cloud-2 { animation: none; }
        }
      `}</style>

      <line x1="10" y1="108" x2="110" y2="108" className="es-ground"
            strokeWidth="1" strokeDasharray="2 4" />

      <g className="es-cloud-1">
        <ellipse cx="20" cy="28" rx="10" ry="3.5" className="es-cloud" />
        <ellipse cx="26" cy="26" rx="6"  ry="3"   className="es-cloud" />
      </g>
      <g className="es-cloud-2">
        <ellipse cx="10" cy="48" rx="8" ry="2.8" className="es-cloud" />
        <ellipse cx="14" cy="46" rx="5" ry="2.5" className="es-cloud" />
      </g>

      <line x1="60" y1="40" x2="60" y2="108" className="es-pole"
            strokeWidth="2" strokeLinecap="round" />

      <g className="es-sign-group">
        <rect x="36" y="20" width="48" height="26" rx="4"
              className="es-sign-bg" strokeWidth="1.5" />
        <circle cx="48" cy="33" r="7" className="es-sign-h" />
        <text x="48" y="37" textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="700" fontSize="10" fill="#FFFFFF">H</text>
        <line x1="60" y1="29" x2="78" y2="29" className="es-sign-line"
              strokeWidth="1.4" strokeLinecap="round" />
        <line x1="60" y1="35" x2="74" y2="35" className="es-sign-line"
              strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      </g>
    </svg>
  );
}
