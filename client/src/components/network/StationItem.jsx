import React from 'react';

function StationItem({ station, isTarget, isCurrent, canClick, onClick }) {
  return (
    <button 
      onClick={() => canClick && onClick(station.id)}
      className={`
        p-2 text-[10px] md:text-sm border transition duration-200
        ${isTarget ? 'bg-yellow-500/20 border-yellow-500 text-yellow-200 font-bold shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'bg-slate-800 border-slate-700 text-slate-300'}
        ${isCurrent ? 'ring-2 ring-blue-500 z-10' : ''}
        ${canClick ? 'hover:bg-slate-700 hover:border-slate-500 cursor-pointer' : 'cursor-default'}
      `}
    >
      <div className="flex flex-col items-center">
        <span className="uppercase tracking-tighter">{station.name}</span>
        <div className="flex gap-1 mt-1">
          {isCurrent && <span className="text-[9px] text-blue-400 font-black">YOU</span>}
          {isTarget && <span className="text-[9px] text-yellow-500 font-black">GOAL</span>}
        </div>
      </div>
    </button>
  );
}

export default StationItem;
