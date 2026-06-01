import db from '../db.js';

class GameDao {
    /**
     * Get all events.
     */
    getEvents() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM events';
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Store a new game result.
     */
    addGame(userId, startStationId, destinationStationId, score) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO games (user_id, start_station_id, destination_station_id, score) VALUES (?, ?, ?, ?)';
            db.run(sql, [userId, startStationId, destinationStationId, score], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    /**
     * Get games for a specific user.
     */
    getGamesByUser(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT g.*, s1.name as start_station, s2.name as destination_station
                FROM games g
                JOIN stations s1 ON g.start_station_id = s1.id
                JOIN stations s2 ON g.destination_station_id = s2.id
                WHERE g.user_id = ?
                ORDER BY g.date DESC
            `;
            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

export default GameDao;
