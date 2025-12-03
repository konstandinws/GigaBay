import db from "../config/db.js";

const refreshSecret = toString(process.env.JWT_REFRESH_TOKEN_SECRET);

class Token{

    static create({ jti, userId, exp}){

        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO tokens 
                (jti, user_id, expiration, revoked)
                VALUES (?, ?, ?, 0)
            `;

            db.run(
                sql,
                [jti, userId, exp],
                function (err) {
                    if (err) reject(err);
                    else resolve({ jti, userId, exp, revoked: 0 });
                }
            );
        });
    }

    static findOne(jti) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM tokens WHERE jti = ?`;
            db.get(sql, [jti], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static delete(jti) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM tokens WHERE jti = ?`;
            db.run(sql, [jti], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
}

export default Token;