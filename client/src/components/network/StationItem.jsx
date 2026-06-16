import React from 'react';
import './MapCanvas.css';

function StationItem({ station, isTarget, isCurrent, canClick, onClick }) {
  return (
    <button 
      onClick={() => canClick && onClick(station.id)}
      className={`
        station-item
        ${isTarget ? 'target' : ''}
        ${isCurrent ? 'current' : ''}
        ${canClick ? 'clickable' : 'not-clickable'}
      `}
    >
      <div className="station-item-content">
        <span className="station-item-name">{station.name}</span>
        <div className="station-item-badges">
          {isCurrent && <span className="badge-you">YOU</span>}
          {isTarget && <span className="badge-goal">GOAL</span>}
        </div>
      </div>
    </button>
  );
}

export default StationItem;
