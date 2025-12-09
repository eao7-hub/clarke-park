import React from 'react';
import { Play, Pause, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { SimulationState } from '../types';

interface ControlsProps {
  state: SimulationState;
  onTogglePlay: () => void;
  onReset: () => void;
  onChangeSpeed: (speed: number) => void;
  onChangeAmplitude: (amp: number) => void;
  onToggleProjections: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  state,
  onTogglePlay,
  onReset,
  onChangeSpeed,
  onChangeAmplitude,
  onToggleProjections,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
           <button
            onClick={onTogglePlay}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 font-medium border ${
              state.isPlaying
                ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            {state.isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            onClick={onReset}
            className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Reiniciar"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={onToggleProjections}
            className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title={state.showProjections ? "Ocultar Projeções" : "Mostrar Projeções"}
          >
            {state.showProjections ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-2 flex-1 min-w-[120px]">
          <span className="text-slate-600 whitespace-nowrap font-medium">Vel: {state.speed.toFixed(1)}x</span>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={state.speed}
            onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-[120px]">
          <span className="text-slate-600 whitespace-nowrap font-medium">Amp: {state.amplitude.toFixed(1)}</span>
          <input
            type="range"
            min="0.2"
            max="1.5"
            step="0.1"
            value={state.amplitude}
            onChange={(e) => onChangeAmplitude(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>
    </div>
  );
};

export default Controls;