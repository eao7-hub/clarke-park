import React, { useState, useEffect, useRef, useCallback } from 'react';
import { calculateThreePhase, calculateClarke, calculatePark, PI } from './utils/math';
import { SimulationState } from './types';
import Controls from './components/Controls';
import VectorPlot from './components/VectorPlot';
import WaveformPlot from './components/WaveformPlot';

// MATLAB-Style Colors (Darker for light background)
const COLORS = {
  a: '#d00000',     // Dark Red (Phase A)
  b: '#0040d0',     // Dark Blue (Phase B)
  c: '#008000',     // Dark Green (Phase C)
  alpha: '#d95f02', // Dark Orange (Alpha)
  beta: '#7b00cf',  // Dark Violet (Beta)
  d: '#0891b2',     // Dark Cyan (D Axis)
  q: '#c026d3',     // Dark Magenta (Q Axis)
  vector: '#111827' // Black/Dark Gray Resultant Vector
};

const HISTORY_LENGTH = 300;

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState>({
    angle: 0,
    speed: 1.0,
    amplitude: 1.0,
    isPlaying: true,
    showProjections: true,
  });

  const historyABCRef = useRef<number[][]>(Array(HISTORY_LENGTH).fill([0, 0, 0]));
  const historyClarkeRef = useRef<number[][]>(Array(HISTORY_LENGTH).fill([0, 0]));
  const historyParkRef = useRef<number[][]>(Array(HISTORY_LENGTH).fill([0, 0]));

  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      
      setState((prevState) => {
        if (!prevState.isPlaying) return prevState;

        const deltaAngle = prevState.speed * 2 * PI * deltaTime;
        const newAngle = (prevState.angle + deltaAngle) % (2 * PI);

        const phase = calculateThreePhase(newAngle, prevState.amplitude);
        const clarke = calculateClarke(phase);
        // We use newAngle for Park to simulate perfect synchronization
        const park = calculatePark(clarke, newAngle); 

        historyABCRef.current.unshift([phase.a, phase.b, phase.c]);
        historyABCRef.current.pop();

        historyClarkeRef.current.unshift([clarke.alpha, clarke.beta]);
        historyClarkeRef.current.pop();

        historyParkRef.current.unshift([park.d, park.q]);
        historyParkRef.current.pop();

        return { ...prevState, angle: newAngle };
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const currentPhase = calculateThreePhase(state.angle, state.amplitude);
  const currentClarke = calculateClarke(currentPhase);
  const currentPark = calculatePark(currentClarke, state.angle);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-6 flex flex-col gap-6">
      
      {/* Top Bar: Title & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Transformada de Clarke & Park
          </h1>
          <p className="text-slate-500 text-sm">Visualização Vetorial (Modelo MATLAB)</p>
        </div>
        <div className="flex-1 w-full md:w-auto md:max-w-2xl">
           <Controls 
              state={state}
              onTogglePlay={() => setState(s => ({ ...s, isPlaying: !s.isPlaying }))}
              onReset={() => {
                  historyABCRef.current = Array(HISTORY_LENGTH).fill([0, 0, 0]);
                  historyClarkeRef.current = Array(HISTORY_LENGTH).fill([0, 0]);
                  historyParkRef.current = Array(HISTORY_LENGTH).fill([0, 0]);
                  setState(s => ({ ...s, angle: 0 }));
              }}
              onChangeSpeed={(speed) => setState(s => ({ ...s, speed }))}
              onChangeAmplitude={(amp) => setState(s => ({ ...s, amplitude: amp }))}
              onToggleProjections={() => setState(s => ({...s, showProjections: !s.showProjections}))}
            />
        </div>
      </div>

      <div className="grid grid-rows-3 gap-8 flex-1">
        
        {/* ROW 1: ABC Domain */}
        <section className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row">
          <div className="p-4 bg-slate-50 md:w-[400px] flex-shrink-0 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-300 relative">
             <div className="absolute top-3 left-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sistema Trifásico (abc)</div>
             <VectorPlot 
                mode="ABC"
                phase={currentPhase} 
                clarke={currentClarke} 
                showProjections={state.showProjections}
                width={320}
                height={320}
                colors={COLORS}
             />
          </div>
          <div className="flex-1 p-4 min-h-[200px] bg-white">
             <WaveformPlot 
                history={historyABCRef.current}
                colors={[COLORS.a, COLORS.b, COLORS.c]}
                labels={['Ia (A)', 'Ib (B)', 'Ic (C)']}
                title=""
                height={300}
                trigger={state.angle}
             />
          </div>
        </section>

        {/* ROW 2: Clarke Domain */}
        <section className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row">
          <div className="p-4 bg-slate-50 md:w-[400px] flex-shrink-0 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-300 relative">
             <div className="absolute top-3 left-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Domínio Clarke (αβ)</div>
             <VectorPlot 
                mode="CLARKE"
                phase={currentPhase} 
                clarke={currentClarke} 
                showProjections={state.showProjections}
                width={320}
                height={320}
                colors={COLORS}
             />
          </div>
          <div className="flex-1 p-4 min-h-[200px] bg-white">
             <WaveformPlot 
                history={historyClarkeRef.current}
                colors={[COLORS.alpha, COLORS.beta]}
                labels={['Iα (Alpha)', 'Iβ (Beta)']}
                title=""
                height={300}
                trigger={state.angle} 
             />
          </div>
        </section>

        {/* ROW 3: Park Domain */}
        <section className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row">
          <div className="p-4 bg-slate-50 md:w-[400px] flex-shrink-0 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-300 relative">
             <div className="absolute top-3 left-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Domínio Park (dq)</div>
             <VectorPlot 
                mode="PARK"
                phase={currentPhase} 
                clarke={currentClarke} 
                park={currentPark}
                showProjections={state.showProjections}
                width={320}
                height={320}
                colors={COLORS}
             />
          </div>
          <div className="flex-1 p-4 min-h-[200px] bg-white">
             <WaveformPlot 
                history={historyParkRef.current}
                colors={[COLORS.d, COLORS.q]}
                labels={['Id (Direct)', 'Iq (Quadrature)']}
                title=""
                height={300}
                trigger={state.angle} 
             />
          </div>
        </section>

      </div>
    </div>
  );
};

export default App;