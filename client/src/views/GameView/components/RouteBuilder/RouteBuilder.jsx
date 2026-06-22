import { useMemo } from 'react';
import './RouteBuilder.css';

function RouteBuilder({
  selectedRoute = [],
  stations = [],
  onUndo,
  segments = [],
  onSegmentClick
}) {
  const uniqueSegments = useMemo(() => {
    const map = new Map();
    for (const seg of segments) {
      const key = [seg.s1_id, seg.s2_id].sort((a, b) => a - b).join('-');
      if (!map.has(key)) {
        map.set(key, {
          s1_id: seg.s1_id,
          s1_name: seg.s1_name,
          s2_id: seg.s2_id,
          s2_name: seg.s2_name
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.s1_name.localeCompare(b.s1_name));
  }, [segments]);

  return (
    <div className="route-builder">
      <div className="active-route-section">
        <h3 className="subway-header">Active Route</h3>
        <div className="route-list">
          {selectedRoute.length === 0 ? (
            <p className="route-empty">
              No segments selected yet...
            </p>
          ) : (
            selectedRoute.map((seg, i) => {
              return (
                <div key={i} className="route-segment">
                  <div className="segment-info">
                    <span className="segment-number">
                      {i + 1}
                    </span>
                    <span className="segment-names">
                      {stations.find(s => s.id === seg[0])?.name} — {stations.find(s => s.id === seg[1])?.name}
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
              );
            })
          )}
        </div>
      </div>

      <div className="segment-list-container">
        <h3 className="subway-header">Network Connections</h3>
        <div className="segment-grid-list">
          {uniqueSegments.map((seg, idx) => {
            const isAlreadySelected = selectedRoute.some(
              s => (s[0] === seg.s1_id && s[1] === seg.s2_id) || (s[0] === seg.s2_id && s[1] === seg.s1_id)
            );

            return (
              <button
                key={idx}
                className={`segment-item-button ${isAlreadySelected ? 'selected' : ''}`}
                onClick={() => onSegmentClick(seg)}
              >
                <div className="segment-graphics-wrapper">
                  <div className="station-box s1">
                    <span className="station-box-name" title={seg.s1_name}>{seg.s1_name}</span>
                    <span className="station-box-dot"></span>
                  </div>

                  <div className="connection-track-container">
                    <div className="connection-track"></div>
                  </div>

                  <div className="station-box s2">
                    <span className="station-box-dot"></span>
                    <span className="station-box-name" title={seg.s2_name}>{seg.s2_name}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RouteBuilder;
