import db from "../config/db.js";

class Auction {

    static create(data) {
        const { title, description, starting_price, end_date, user_id } = data;

        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO auctions 
                (title, description, starting_price, current_price, end_date, user_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.run(
                sql,
                [title, description, starting_price, starting_price, end_date, user_id],
                function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...data });
                }
            );
        });
    }

    static getAll() {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM auctions", [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static findById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                "SELECT * FROM auctions WHERE id = ?",
                [id],
                (err, row) => err ? reject(err) : resolve(row)
            );
        });
    }

    static addImage(auctionId, filename) {
        return new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO images (filename, auction_id) VALUES (?, ?)",
                [filename, auctionId],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, filename, auction_id: auctionId });
                }
            );
        });
    }

    static updateImage(id, imageUrl) {
        return new Promise((resolve, reject) => {
            // Cette requête met à jour la colonne image_url de la table auctions
            db.run(
                "UPDATE auctions SET image_url = ? WHERE id = ?",
                [imageUrl, id],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.changes > 0);
                }
            );
        });
    }

    static updateCurrentPrice(id, newPrice) {
        return new Promise((resolve, reject) => {
            db.run(
                "UPDATE auctions SET current_price = ? WHERE id = ?",
                [newPrice, id],
                function (err) {
                    if (err) reject(err);
                    else resolve(true);
                }
            );
        });
    }
}

export default Auction;