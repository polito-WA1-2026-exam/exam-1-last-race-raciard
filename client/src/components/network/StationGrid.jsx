import React from 'react';
import StationItem from './StationItem';

function StationGrid({ stations, highlightStations, currentStationId, onStationClick }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
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
