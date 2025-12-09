import React, { useId } from 'react';

interface WaveformPlotProps {
  history: number[][]; 
  colors: string[];
  labels: string[];
  title: string;
  height?: number;
  min?: number;
  max?: number;
  trigger?: number; // Dependency to force re-render
}

const WaveformPlot: React.FC<WaveformPlotProps> = ({
  history,
  colors,
  labels,
  title,
  height = 300,
  min = -1.5,
  max = 1.5,
}) => {
  const width = 1000;
  const pointsCount = history.length;
  // Generate a unique ID for the SVG pattern to avoid conflicts between multiple plots
  const uniqueId = useId();
  const gridId = `grid-${uniqueId}`;

  // Generate paths directly without useMemo caching to ensure 
  // they update strictly on every render cycle (smoother animation)
  const paths = colors.map(() => "");
  
  if (pointsCount >= 2) {
    for (let lineIndex = 0; lineIndex < colors.length; lineIndex++) {
      let d = "";
      for (let i = 0; i < pointsCount; i++) {
        const x = width - (i / (pointsCount - 1)) * width;
        const val = history[i][lineIndex];
        const normalizedVal = (val - min) / (max - min);
        const y = height - normalizedVal * height;

        if (i === 0) {
          d += `M ${x} ${y}`;
        } else {
          d += ` L ${x} ${y}`;
        }
      }
      paths[lineIndex] = d;
    }
  }

  return (
    <div className="h-full flex flex-col relative group select-none">
       {/* Labels Overlay */}
      <div className="absolute top-2 left-2 flex gap-4 text-xs z-10 bg-white/90 p-2 rounded border border-slate-200 shadow-sm backdrop-blur-sm">
        {labels.map((label, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: colors[idx] }}></div>
                <span style={{ color: colors[idx] }} className="font-bold">{label}</span>
            </div>
        ))}
      </div>

      <div className="flex-1 w-full h-full">
         <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="w-full h-full block"
            shapeRendering="geometricPrecision"
         >
             {/* Grid */}
             <defs>
               <pattern id={gridId} width="100" height={height/4} patternUnits="userSpaceOnUse">
                 <path d={`M 100 0 L 0 0 0 ${height/4}`} fill="none" stroke="#e2e8f0" strokeWidth="1"/>
               </pattern>
             </defs>
             <rect width="100%" height="100%" fill={`url(#${gridId})`} />

             {/* Zero Line */}
             <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />

             {/* Waveforms */}
             {paths.map((d, idx) => (
                 <path
                    key={idx}
                    d={d}
                    fill="none"
                    stroke={colors[idx]}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                 />
             ))}

             {/* Current Time Indicator (Right Edge) */}
             <line x1={width} y1={0} x2={width} y2={height} stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
         </svg>
      </div>
       <div className="text-right text-xs text-slate-400 mt-1 font-mono">
           Tempo (t) &rarr;
       </div>
    </div>
  );
};

export default WaveformPlot;