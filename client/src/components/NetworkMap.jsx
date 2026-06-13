import React, { useRef, useState, useEffect } from 'react';
import MapCanvas from './network/MapCanvas';

const LINE_PALETTE = ['#EE352E', '#0039A6', '#00933C', '#FCCC0A', '#B933AD', '#00ADD0', '#FF6319', '#6CBE45'];

function NetworkMap({ stations, lines, highlightStations, onStationClick, currentStationId, showLines = true, characterState = 'idle', walkProgress = 0, currentSegment = null, gameResult = null, execStep = 0, phase, selectedRoute = [], character = 'Player' }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Prevent body scroll when map is in theater mode
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isExpanded]);

  return (
    <div className={`relative w-full overflow-hidden shadow-2xl border-slate-700 transition-all ${isExpanded ? 'fixed inset-0 z-[100] w-screen h-screen bg-slate-950 p-4 md:p-12' : 'rounded-xl border-4 md:border-8'}`}>
      
      {/* Station Wall Aesthetic (Subway Tiles) - Dark Version */}
      <div className={`absolute inset-0 bg-slate-900 ${isExpanded ? 'opacity-90' : ''}`} 
           style={{ 
             backgroundImage: 'linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.02) 5%), linear-gradient(0deg, transparent 95%, rgba(255,255,255,0.02) 5%)',
             backgroundSize: '40px 20px' 
           }}>
      </div>

      {/* Industrial Frame Wrapper */}
      <div className={`relative z-10 bg-slate-950/95 border-slate-700 rounded shadow-2xl flex flex-col transition-all
        ${isExpanded 
          ? 'm-0 min-h-full p-4 md:p-10 border-4' 
          : 'm-0 lg:m-1 p-2 md:p-4 lg:p-6 border-2 md:border-4 min-h-[350px] md:min-h-[550px] lg:min-h-[750px]'}`}>

        
        {/* Signage Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 md:mb-10 border-b-2 md:border-b-4 border-slate-700 pb-2 md:pb-6 gap-2 md:gap-4">
          <div className="flex items-center">
            <div className="w-8 h-8 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center mr-2 md:mr-5 flex-shrink-0">
              <span className="text-black font-black text-sm md:text-2xl">M</span>
            </div>
            <div>
              <h3 className="font-black text-lg md:text-3xl uppercase tracking-tighter leading-none mb-0.5 md:mb-1 text-white">System Map</h3>
              <p className="text-[7px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] md:tracking-[0.2em]">Network Authority • v2.6</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto text-white">
             <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 px-3 py-1 font-black text-[9px] md:text-xs uppercase transition shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
             >
                {isExpanded ? '⏹ Minimize' : '⛶ Maximize'}
             </button>
             <div className="bg-yellow-400 px-2 py-1 font-black text-[9px] md:text-xs uppercase transform -rotate-1 shadow-sm border-2 border-black/10 text-black">
               Service Normal
             </div>
          </div>
        </header>
        
        {/* Dynamic SVG Map Container - Centered & Scrollable on Mobile */}
        <div className="flex-1 w-full overflow-auto bg-slate-900/50 rounded border border-slate-800 p-0 md:p-4 shadow-inner custom-scrollbar flex items-center justify-center">
          <div className="min-w-[800px] md:min-w-0 w-full h-full flex items-center justify-center m-auto">
            <div className="w-full h-full flex items-center justify-center">
              <MapCanvas 
                stations={stations}
                lines={lines}
                highlightStations={highlightStations}
                onStationClick={onStationClick}
                currentStationId={currentStationId}
                showLines={showLines}
                characterState={characterState}
                walkProgress={walkProgress}
                currentSegment={currentSegment}
                palette={LINE_PALETTE}
                gameResult={gameResult}
                execStep={execStep}
                phase={phase}
                selectedRoute={selectedRoute}
                character={character}
                />
            </div>
          </div>
        </div>

        {/* Mobile Scroll Hint */}
        <div className="md:hidden mt-2 flex justify-center">
           <span className="text-[8px] font-bold text-blue-500 animate-pulse uppercase tracking-widest flex items-center gap-1">
             ← Swipe Map to Navigate →
           </span>
        </div>

        {/* Footer - Detailed Station Info */}
        <footer className="mt-6 md:mt-10 pt-4 md:pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-4 grayscale opacity-70">
           <div className="flex flex-wrap gap-6 md:gap-12">
              <div className="space-y-1">
                 <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest">Accessibility</p>
                 <div className="flex gap-3 text-lg md:text-xl">♿ 🛗 🚾</div>
              </div>
              <div className="space-y-2">
                 <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest">Transfer Points</p>
                 <div className="flex flex-wrap gap-1.5">
                    {lines.map((l, idx) => (
                      <div key={l.id} className="flex items-center group">
                        <span className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[9px] md:text-[11px] font-black text-white shadow-sm transition-transform group-hover:scale-110" 
                              style={{ backgroundColor: LINE_PALETTE[idx % LINE_PALETTE.length] }}>
                          {l.name.charAt(0)}
                        </span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
           
           <div className="flex flex-col items-end gap-1">
              <div className="text-[8px] md:text-[9px] font-mono text-slate-500 font-bold tracking-tighter">
                REF_ID: 0x48FA_SUB_NW_2026
              </div>
              <div className="text-[7px] uppercase font-black text-slate-600">
                Printed via Terminal Engine v4.2
              </div>
           </div>
        </footer>
      </div>

      {/* Glass/Dust Effect Layer */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-transparent to-white/5 opacity-30"></div>
    </div>
  );
}

export default NetworkMap;
