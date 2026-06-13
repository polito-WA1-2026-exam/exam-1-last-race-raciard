import React from 'react';

function RouteBuilder({ selectedRoute, stations, onUndo }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Active Route</h3>
      <div className="space-y-2">
        {selectedRoute.length === 0 ? (
          <p className="text-sm text-slate-600 italic bg-slate-800/30 p-4 border border-slate-800 border-dashed text-center">
            No segments selected yet...
          </p>
        ) : (
          selectedRoute.map((seg, i) => (
            <div key={i} className="text-sm p-3 bg-slate-800/50 border border-slate-700 flex justify-between items-center group">
              <div className="flex items-center text-slate-200">
                <span className="w-5 h-5 bg-slate-700 text-[10px] flex items-center justify-center rounded-full mr-3 text-slate-400 font-bold">
                  {i + 1}
                </span>
                <span className="font-medium">
                  {stations.find(s => s.id === seg.s1_id)?.name} → {stations.find(s => s.id === seg.s2_id)?.name}
                </span>
              </div>
              {i === selectedRoute.length - 1 && (
                <button 
                  onClick={onUndo} 
                  className="text-red-500 hover:text-red-400 font-bold text-xs"
                >
                  REMOVE
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RouteBuilder;
