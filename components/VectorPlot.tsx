import React from 'react';
import { PhaseValues, ClarkeValues, ParkValues } from '../types';
import { PI } from '../utils/math';

interface VectorPlotProps {
  phase: PhaseValues;
  clarke: ClarkeValues;
  park?: ParkValues;
  width?: number;
  height?: number;
  showProjections: boolean;
  mode: 'ABC' | 'CLARKE' | 'PARK';
  colors: {
    a: string;
    b: string;
    c: string;
    alpha: string;
    beta: string;
    d: string;
    q: string;
    vector: string;
  };
}

// Component to draw a line with a manual arrowhead to avoid browser marker jitter
const ArrowLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  arrowSize?: number;
  dash?: string;
  opacity?: number;
  hasArrow?: boolean;
}> = ({ x1, y1, x2, y2, color, width, arrowSize = 10, dash, opacity = 1, hasArrow = true }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);

  // FIX: If vector is too short (like Q component being 0), do not render to avoid artifacts
  if (length < 2) {
    return null;
  }

  if (!hasArrow) {
     return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeDasharray={dash} opacity={opacity} strokeLinecap="round" />;
  }

  const angle = Math.atan2(dy, dx);
  // Arrowhead points
  const p1x = x2 - arrowSize * Math.cos(angle - Math.PI / 6);
  const p1y = y2 - arrowSize * Math.sin(angle - Math.PI / 6);
  const p2x = x2 - arrowSize * Math.cos(angle + Math.PI / 6);
  const p2y = y2 - arrowSize * Math.sin(angle + Math.PI / 6);

  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}`} fill={color} />
    </g>
  );
};

const VectorPlot: React.FC<VectorPlotProps> = ({
  phase,
  clarke,
  park,
  width = 300,
  height = 300,
  showProjections,
  mode,
  colors
}) => {
  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min(width, height) / 3;

  // Helpers
  const getSvgCoords = (magnitude: number, angleRad: number) => {
    // In SVG, Y is positive down. 
    // We want standard math: X right, Y up.
    return {
      x: cx + magnitude * scale * Math.cos(angleRad),
      y: cy - magnitude * scale * Math.sin(angleRad),
    };
  };

  const axisLength = 1.3;
  
  // ABC Axes Angles (A=0, B=120, C=240)
  const posA = getSvgCoords(axisLength, 0);
  const posB = getSvgCoords(axisLength, 2 * PI / 3);
  const posC = getSvgCoords(axisLength, 4 * PI / 3);

  // Instantaneous Phasors
  const vecA = getSvgCoords(phase.a, 0);
  const vecB = getSvgCoords(phase.b, 2 * PI / 3);
  const vecC = getSvgCoords(phase.c, 4 * PI / 3);

  // Resultant Vector (Alpha/Beta Frame)
  const vecR_Clarke = {
    x: cx + clarke.alpha * scale,
    y: cy - clarke.beta * scale, 
  };

  // Resultant Vector (Park Frame) - Here d is along X, q is along Y (rotated 90 deg)
  const vecR_Park = park ? {
    x: cx + park.d * scale,
    y: cy - park.q * scale
  } : { x: cx, y: cy };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} shapeRendering="geometricPrecision">
        {/* Background Grid Circles */}
        <circle cx={cx} cy={cy} r={scale} stroke="#e2e8f0" fill="none" strokeDasharray="4 4" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={scale * 0.5} stroke="#e2e8f0" fill="none" strokeDasharray="4 4" strokeWidth="1" />

        {/* =================================================================================
            MODE: ABC 
           ================================================================================= */}
        {mode === 'ABC' && (
          <>
            {/* Axes */}
            <line x1={cx} y1={cy} x2={posA.x} y2={posA.y} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
            <text x={posA.x + 10} y={posA.y} fill={colors.a} fontSize="12" fontWeight="bold" alignmentBaseline="middle">a</text>

            <line x1={cx} y1={cy} x2={posB.x} y2={posB.y} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
            <text x={posB.x - 10} y={posB.y - 10} fill={colors.b} fontSize="12" fontWeight="bold" textAnchor="middle">b</text>

            <line x1={cx} y1={cy} x2={posC.x} y2={posC.y} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
            <text x={posC.x - 10} y={posC.y + 20} fill={colors.c} fontSize="12" fontWeight="bold" textAnchor="middle">c</text>

            {/* Instantaneous Phasors - Drawn manually for smoothness */}
            {showProjections && (
              <>
                 <ArrowLine x1={cx} y1={cy} x2={vecA.x} y2={vecA.y} color={colors.a} width={2} arrowSize={6} />
                 <ArrowLine x1={cx} y1={cy} x2={vecB.x} y2={vecB.y} color={colors.b} width={2} arrowSize={6} />
                 <ArrowLine x1={cx} y1={cy} x2={vecC.x} y2={vecC.y} color={colors.c} width={2} arrowSize={6} />

                 {/* Dashed projection from Resultant to Tips */}
                 <line x1={vecR_Clarke.x} y1={vecR_Clarke.y} x2={vecA.x} y2={vecA.y} stroke={colors.a} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                 <line x1={vecR_Clarke.x} y1={vecR_Clarke.y} x2={vecB.x} y2={vecB.y} stroke={colors.b} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                 <line x1={vecR_Clarke.x} y1={vecR_Clarke.y} x2={vecC.x} y2={vecC.y} stroke={colors.c} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
              </>
            )}

            {/* Resultant Vector */}
            <ArrowLine x1={cx} y1={cy} x2={vecR_Clarke.x} y2={vecR_Clarke.y} color={colors.vector} width={3} arrowSize={10} />
            <circle cx={cx} cy={cy} r="3" fill={colors.vector} />
          </>
        )}

        {/* =================================================================================
            MODE: CLARKE 
           ================================================================================= */}
        {mode === 'CLARKE' && (
          <>
            {/* Axes */}
            <line x1={cx - width/2} y1={cy} x2={cx + width/2} y2={cy} stroke="#94a3b8" strokeWidth="1" />
            <line x1={cx} y1={cy + height/2} x2={cx} y2={cy - height/2} stroke="#94a3b8" strokeWidth="1" />
            
            <text x={cx + width/2 - 20} y={cy - 10} fill={colors.alpha} fontSize="14" fontWeight="bold">α</text>
            <text x={cx + 10} y={cy - height/2 + 20} fill={colors.beta} fontSize="14" fontWeight="bold">β</text>

            {/* Components */}
            {showProjections && (
              <>
                 {/* Alpha Vector */}
                 <ArrowLine x1={cx} y1={cy} x2={cx + clarke.alpha * scale} y2={cy} color={colors.alpha} width={3} arrowSize={8} />
                 {/* Beta Vector */}
                 <ArrowLine x1={cx} y1={cy} x2={cx} y2={cy - clarke.beta * scale} color={colors.beta} width={3} arrowSize={8} />

                 {/* Projection Boxes - Only show if components are significant */}
                 {Math.abs(clarke.beta) > 0.05 && (
                    <line x1={cx + clarke.alpha * scale} y1={cy} x2={vecR_Clarke.x} y2={vecR_Clarke.y} stroke={colors.alpha} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                 )}
                 {Math.abs(clarke.alpha) > 0.05 && (
                    <line x1={cx} y1={cy - clarke.beta * scale} x2={vecR_Clarke.x} y2={vecR_Clarke.y} stroke={colors.beta} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                 )}
              </>
            )}
            
            {/* Resultant Vector */}
            <ArrowLine x1={cx} y1={cy} x2={vecR_Clarke.x} y2={vecR_Clarke.y} color={colors.vector} width={3} arrowSize={10} />
            <circle cx={cx} cy={cy} r="3" fill={colors.vector} />
          </>
        )}

        {/* =================================================================================
            MODE: PARK 
           ================================================================================= */}
        {mode === 'PARK' && park && (
          <>
            {/* Axes (Static in this view, representing the rotating frame) */}
            <line x1={cx - width/2} y1={cy} x2={cx + width/2} y2={cy} stroke="#94a3b8" strokeWidth="1" />
            <line x1={cx} y1={cy + height/2} x2={cx} y2={cy - height/2} stroke="#94a3b8" strokeWidth="1" />
            
            <text x={cx + width/2 - 20} y={cy - 10} fill={colors.d} fontSize="14" fontWeight="bold">d</text>
            <text x={cx + 10} y={cy - height/2 + 20} fill={colors.q} fontSize="14" fontWeight="bold">q</text>

            {/* Components */}
            {showProjections && (
              <>
                 {/* D Vector */}
                 <ArrowLine x1={cx} y1={cy} x2={cx + park.d * scale} y2={cy} color={colors.d} width={3} arrowSize={8} />
                 {/* Q Vector */}
                 <ArrowLine x1={cx} y1={cy} x2={cx} y2={cy - park.q * scale} color={colors.q} width={3} arrowSize={8} />

                 {/* Projection Boxes - Only show if components are significant (avoids lines on top of axes) */}
                 {Math.abs(park.q) > 0.05 && (
                    <line x1={cx + park.d * scale} y1={cy} x2={vecR_Park.x} y2={vecR_Park.y} stroke={colors.d} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                 )}
                 {Math.abs(park.d) > 0.05 && (
                    <line x1={cx} y1={cy - park.q * scale} x2={vecR_Park.x} y2={vecR_Park.y} stroke={colors.q} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                 )}
              </>
            )}

            {/* Resultant Vector in Park Frame (Should be stationary/steady) */}
            <ArrowLine x1={cx} y1={cy} x2={vecR_Park.x} y2={vecR_Park.y} color={colors.vector} width={3} arrowSize={10} />
            <circle cx={cx} cy={cy} r="3" fill={colors.vector} />
          </>
        )}

    </svg>
  );
};

export default VectorPlot;