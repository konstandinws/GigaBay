import db from "../config/db.js";

class Comment {
    static create({ content, userId, auctionId, username }) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO comments (content, user_id, auction_id, username) 
                VALUES (?, ?, ?, ?)
            `;
            db.run(sql, [content, userId, auctionId, username], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, content, userId, auctionId, username, created_at: new Date() });
            });
        });
    }

    static getByAuctionId(auctionId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM comments WHERE auction_id = ? ORDER BY created_at ASC`;
            db.all(sql, [auctionId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

export default Comment;