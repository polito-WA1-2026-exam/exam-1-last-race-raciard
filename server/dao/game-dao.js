import db from '../db.js';

class GameDao {
    /**
     * Retrieves all possible game events from the database.
     * @returns {Promise<Array<{id: number, name: string, description: string, effect: number}>>} A promise that resolves to an array of event objects.
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
     * Stores a new completed or failed game session result in the database.
     * @param {number} userId - The ID of the user who played the game.
     * @param {number} startStationId - The ID of the starting station.
     * @param {number} destinationStationId - The ID of the destination station.
     * @param {number} score - The final score (remaining coins) of the game.
     * @returns {Promise<number>} A promise that resolves to the auto-incremented ID of the inserted game record.
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
     * Retrieves all game records played by a specific user, including station names.
     * Sorted by date in descending order.
     * @param {number} userId - The ID of the user whose game history is retrieved.
     * @returns {Promise<Array<{id: number, user_id: number, start_station_id: number, destination_station_id: number, score: number, date: string, start_station: string, destination_station: string}>>} A promise that resolves to an array of game records.
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
