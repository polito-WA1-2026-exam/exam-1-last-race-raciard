import React from 'react';
import './MapCanvas.css';

function LineInfo({ lines }) {
  return (
    <div className="line-info-container">
      <h4 className="line-info-header">Network Data</h4>
      <div className="line-info-list">
        {lines.map(line => (
          <div key={line.id} className="line-info-item">
            <span className="line-info-name">{line.name}:</span>
            <span className="line-info-data">
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
