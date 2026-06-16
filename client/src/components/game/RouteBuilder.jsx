import React from 'react';
import './RouteBuilder.css';

function RouteBuilder({ selectedRoute, stations, onUndo }) {
  return (
    <div className="route-builder">
      <h3 className="route-builder-header">Active Route</h3>
      <div className="route-list">
        {selectedRoute.length === 0 ? (
          <p className="route-empty">
            No segments selected yet...
          </p>
        ) : (
          selectedRoute.map((seg, i) => (
            <div key={i} className="route-segment">
              <div className="segment-info">
                <span className="segment-number">
                  {i + 1}
                </span>
                <span className="segment-names">
                  {stations.find(s => s.id === seg.s1_id)?.name} → {stations.find(s => s.id === seg.s2_id)?.name}
                </span>
              </div>
              {i === selectedRoute.length - 1 && (
                <button 
                  onClick={onUndo} 
                  className="remove-segment-button"
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
