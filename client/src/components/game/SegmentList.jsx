import React from 'react';
import './RouteBuilder.css';

function SegmentList({ segments, onToggle }) {
  return (
    <div className="segment-list-container">
      <h3 className="segment-list-header">Available Connections</h3>
      <div className="segment-grid-list">
        {segments.map((seg, i) => (
          <button 
            key={i}
            onClick={() => onToggle(seg)}
            className="segment-item-button"
          >
            <div className="segment-item-content">
              <span className="segment-item-names">
                {seg.s1_name} ↔ {seg.s2_name}
              </span>
              <span className="segment-item-line">via {seg.line_name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SegmentList;
