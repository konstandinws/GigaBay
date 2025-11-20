let auctionsDB = [
    { id: 1, title: "Vélo Vintage", price: 50, end: "2024-12-01" },
    { id: 2, title: "PlayStation 1", price: 20, end: "2024-11-30" }
]

// le modele gere uniquement les donnees
// definit l'acces aux donnees

class Auction{

    static getAll(){
        return auctionsDB;
    }

    static findById(id){
        return auctionsDB.find(item => item.id === parseInt(id))
    }

    static addAuction(auction){
        const id = auctionsDB.length + 1;
        auctionsDB.push({id: id, ...auction});
    }

};

export default Auction;