import './RouteBuilder.css';

function RouteBuilder({ selectedRoute = [], stations = [], onUndo }) {
  return (
    <div className="route-builder">
      <h3 className="subway-header">Active Route</h3>
      <div className="route-list">
        {selectedRoute.length <= 1 ? (
          <p className="route-empty">
            No segments selected yet...
          </p>
        ) : (
          selectedRoute.slice(1).map((stationId, i) => {
            const fromId = selectedRoute[i];
            const toId = stationId;
            return (
              <div key={i} className="route-segment">
                <div className="segment-info">
                  <span className="segment-number">
                    {i + 1}
                  </span>
                  <span className="segment-names">
                    {stations.find(s => s.id === fromId)?.name} → {stations.find(s => s.id === toId)?.name}
                  </span>
                </div>
                {i === selectedRoute.length - 2 && (
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
  );
}

export default RouteBuilder;

