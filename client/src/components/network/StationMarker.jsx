

/**
 * Renders an SVG representation of a subway station on the network map.
 * 
 * @param {object} props
 * @param {object} props.station - The station data object (id, name).
 * @param {object} props.coords - The {x, y} SVG coordinates for the station.
 * @param {boolean} props.isTarget - Whether this station is the destination/target.
 * @param {boolean} props.isCurrent - Whether the character is currently at this station.
 * @param {boolean} props.canClick - Whether the station can be clicked (active in PLANNING phase).
 * @param {function} props.onClick - Callback fired when the station is clicked.
 * @param {boolean} props.isInterchange - Whether the station serves multiple lines.
 */
function StationMarker({ station, coords, isTarget, isCurrent, canClick, onClick, isInterchange }) {
  return (
    <g
      className={`station-marker-group ${canClick ? 'clickable' : ''}`}
      onClick={() => canClick && onClick(station.id)}
    >
      {/* Background glow for current/target */}
      {isCurrent && <circle cx={coords.x} cy={coords.y} r="25" fill="rgba(59, 130, 246, 0.2)" className="animate-pulse" />}
      {isTarget && <circle cx={coords.x} cy={coords.y} r="25" fill="rgba(234, 179, 8, 0.2)" className="animate-pulse" />}

      {/* Main marker */}
      {isInterchange ? (
        <circle
          cx={coords.x}
          cy={coords.y}
          r="10"
          fill="white"
          stroke="#1e293b"
          strokeWidth="3"
        />
      ) : (
        <circle
          cx={coords.x}
          cy={coords.y}
          r="7"
          fill="white"
          stroke="#475569"
          strokeWidth="2"
        />
      )}

      {/* Active indicators */}
      {isTarget && <circle cx={coords.x} cy={coords.y} r="6" fill="#eab308" />}

      {/* Label with 'Subway Signage' feel */}
      <text
        x={coords.x}
        y={coords.y + 28}
        textAnchor="middle"
        className={`
          station-label-text
          ${isTarget ? 'station-label-target' : isCurrent ? 'station-label-current' : 'station-label-standard'}
        `}
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {station.name}
      </text>
    </g>
  );
}

export default StationMarker;
