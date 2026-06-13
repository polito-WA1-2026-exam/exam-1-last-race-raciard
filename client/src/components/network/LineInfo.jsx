import React from 'react';

function LineInfo({ lines }) {
  return (
    <div className="mt-6 border-t border-slate-800 pt-4">
      <h4 className="font-bold text-sm mb-2 text-slate-500 uppercase tracking-widest">Network Data</h4>
      <div className="space-y-3">
        {lines.map(line => (
          <div key={line.id} className="text-[10px] bg-slate-900/50 p-2 border border-slate-800 rounded">
            <span className="font-black text-blue-400 mr-2 uppercase">{line.name}:</span>
            <span className="text-slate-500 font-medium">
              {line.stations.map((s, i) => (
                <span key={s.id}>
                  {s.name.toUpperCase()}{i < line.stations.length - 1 ? ' → ' : ''}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LineInfo;
