import db from "../config/db.js";

class User {

    static create(username, email, password) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO users (username, email, password)
                VALUES (?, ?, ?)
            `;
            db.run(sql, [username, email, password], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, username, email });
            });
        });
    }

    static findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get(
                "SELECT * FROM users WHERE email = ?",
                [email],
                (err, row) => err ? reject(err) : resolve(row)
            );
        });
    }

    static findById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                "SELECT * FROM users WHERE id = ?",
                [id],
                (err, row) => err ? reject(err) : resolve(row)
            );
        });
    }

    static updateBalance(id, amount) {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE users SET balance = balance + ? WHERE id = ?";
            db.run(sql, [amount, id], function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    }
}

export default User;