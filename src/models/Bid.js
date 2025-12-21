import db from "../config/db.js";

class Bid {

    static create({ amount, user_id, auction_id }) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO bids (amount, user_id, auction_id)
                VALUES (?, ?, ?)
            `;

            db.run(sql, [amount, user_id, auction_id], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, amount, user_id, auction_id });
            });
        });
    }

    static getByAuction(auction_id) {
        return new Promise((resolve, reject) => {
            db.all(
                "SELECT * FROM bids WHERE auction_id = ?",
                [auction_id],
                (err, rows) => err ? reject(err) : resolve(rows)
            );
        });
    }

    static findHighest(auction_id) {
        return new Promise((resolve, reject) => {
            // On récupère l'enchère avec le montant le plus élevé pour cet objet
            const sql = "SELECT * FROM bids WHERE auction_id = ? ORDER BY amount DESC LIMIT 1";
            db.get(sql, [auction_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
}

export default Bid;