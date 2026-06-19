import db from '../db.js';
import crypto from 'crypto';

class UserDao {
    /**
     * Retrieves a user by their user ID.
     * @param {number} id - The ID of the user.
     * @returns {Promise<{id: number, username: string}|{error: string}>} A promise that resolves to the user object (id and username) or an error object if not found.
     */
    getUserById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else if (row === undefined) resolve({ error: 'User not found.' });
                else {
                    const user = { id: row.id, username: row.username };
                    resolve(user);
                }
            });
        });
    }

    /**
     * Authenticates a user by checking their username and validating their password hash using scrypt.
     * @param {string} username - The username to verify.
     * @param {string} password - The plain-text password to verify.
     * @returns {Promise<{id: number, username: string}|boolean>} A promise that resolves to the user object if authenticated, or false otherwise.
     */
    getUser(username, password) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE username = ?';
            db.get(sql, [username], (err, row) => {
                if (err) reject(err);
                else if (row === undefined) resolve(false);
                else {
                    const user = { id: row.id, username: row.username };
                    const salt = row.salt;
                    crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
                        if (err) reject(err);
                        const passwordHex = Buffer.from(row.hash, 'hex');
                        if (!crypto.timingSafeEqual(passwordHex, hashedPassword))
                            resolve(false);
                        else resolve(user);
                    });
                }
            });
        });
    }

    /**
     * Retrieves the global user rankings list, containing the best score achieved by each user.
     * Sorted by best score in descending order.
     * @returns {Promise<Array<{username: string, best_score: number}>>} A promise resolving to an array of user rankings.
     */
    getRanking() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT u.username, MAX(g.score) as best_score
                FROM users u
                JOIN games g ON u.id = g.user_id
                GROUP BY u.id
                ORDER BY best_score DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

export default UserDao;
