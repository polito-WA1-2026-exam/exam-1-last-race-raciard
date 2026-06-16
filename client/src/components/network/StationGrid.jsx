import React from 'react';
import StationItem from './StationItem';
import './MapCanvas.css';

function StationGrid({ stations, highlightStations, currentStationId, onStationClick }) {
  return (
    <div className="station-grid">
      {stations.map(station => (
        <StationItem 
          key={station.id}
          station={station}
          isTarget={highlightStations.includes(station.id)}
          isCurrent={station.id === currentStationId}
          canClick={!!onStationClick}
          onClick={onStationClick}
        />
      ))}
    </div>
  );
}

export default StationGrid;
