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

            db.run(   //execute la requete
                sql,
                //current_price est initialisé avec la mm valeur que starting_price
                [title, description, starting_price, starting_price, end_date, user_id],
                function (err) {
                    if (err) reject(err);
                    // this.lastID = id auto-incrémenté généré par SQLite
                    else resolve({ id: this.lastID, ...data });
                }
            );
        });
    }

    static getAll(limit = 12, offset = 0, search = null) { // <--- Ajout du param search
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM auctions";
        let params = [];

        // Si on cherche quelque chose, on filtre
        if (search) {
            sql += " WHERE title LIKE ? OR description LIKE ?";
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += " ORDER BY id DESC LIMIT ? OFFSET ?";
        params.push(limit, offset); // On ajoute limit/offset à la fin des params

        db.all(sql, params, (err, rows) => {
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

    static update(id, { title, description }) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE auctions 
                SET title = ?, description = ?
                WHERE id = ?
            `;
            // On ne passe plus que title, description et id
            db.run(sql, [title, description, id], function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    }

    static findByUserId(userId) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM auctions WHERE user_id = ? ORDER BY id DESC";
            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static addImage(auctionId, filename) {
        return new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO images (filename, auction_id) VALUES (?, ?)",
                [filename, auctionId],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, 
                        filename,
                        auction_id: auctionId,
                    });
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