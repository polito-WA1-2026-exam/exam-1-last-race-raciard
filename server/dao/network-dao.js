import db from '../db.js';

class NetworkDao {
    /**
     * Get all stations from the database.
     */
    getStations() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM stations';
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Get all lines and their stations.
     */
    getLines() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT l.id as line_id, l.name as line_name, s.id as station_id, s.name as station_name, c.position
                FROM lines l
                JOIN connections c ON l.id = c.line_id
                JOIN stations s ON c.station_id = s.id
                ORDER BY l.id, c.position
            `;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else {
                    const lines = rows.reduce((acc, row) => {
                        if (!acc[row.line_id]) {
                            acc[row.line_id] = {
                                id: row.line_id,
                                name: row.line_name,
                                stations: []
                            };
                        }
                        acc[row.line_id].stations.push({
                            id: row.station_id,
                            name: row.station_name,
                            position: row.position
                        });
                        return acc;
                    }, {});
                    resolve(Object.values(lines));
                }
            });
        });
    }

    /**
     * Get all segments (pairs of connected stations on the same line).
     * Returns each physical connection only once.
     */
    getSegments() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT c1.station_id as s1_id, s1.name as s1_name, 
                       c2.station_id as s2_id, s2.name as s2_name,
                       l.id as line_id, l.name as line_name
                FROM connections c1
                JOIN connections c2 ON c1.line_id = c2.line_id AND c2.position = c1.position + 1
                JOIN stations s1 ON c1.station_id = s1.id
                JOIN stations s2 ON c2.station_id = s2.id
                JOIN lines l ON c1.line_id = l.id
            `;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Get an adjacency list of the network.
     * Each station ID maps to an array of objects { to: stationId, lineId: lineId }
     */
    async getAdjacencyList() {
        const segments = await this.getSegments();
        const adj = {};
        segments.forEach(seg => {
            if (!adj[seg.s1_id]) adj[seg.s1_id] = [];
            if (!adj[seg.s2_id]) adj[seg.s2_id] = [];
            
            // Explicitly add both directions to the adjacency list for validation/search
            adj[seg.s1_id].push({ to: seg.s2_id, lineId: seg.line_id });
            adj[seg.s2_id].push({ to: seg.s1_id, lineId: seg.line_id });
        });
        return adj;
    }
}

export default NetworkDao;
