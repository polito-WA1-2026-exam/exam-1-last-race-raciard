import React from 'react';

function SegmentList({ segments, onToggle }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-sm text-gray-700 uppercase tracking-widest border-b pb-2">Available Connections</h3>
      <div className="grid grid-cols-1 gap-1">
        {segments.map((seg, i) => (
          <button 
            key={i}
            onClick={() => onToggle(seg)}
            className="text-left text-[11px] p-2 border bg-white hover:bg-blue-50 hover:border-blue-200 transition group"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-700 group-hover:text-blue-700">
                {seg.s1_name} ↔ {seg.s2_name}
              </span>
              <span className="text-[9px] text-gray-400 italic">via {seg.line_name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SegmentList;
