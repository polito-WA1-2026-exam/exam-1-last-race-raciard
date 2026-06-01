import db from '../db.js';
import crypto from 'crypto';

class UserDao {
    /**
     * Get user by id.
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
     * Get user by credentials.
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
     * Get the global ranking (best score for each user).
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
