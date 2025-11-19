let auctionsDB = [
    { id: 1, title: "Vélo Vintage", price: 50, end: "2024-12-01" },
    { id: 2, title: "PlayStation 1", price: 20, end: "2024-11-30" }
]

const Auction = {

    getAllAuctions(){
        const auctions = Auction.getAll();
        return auctions;
    },

    findById(id){
        return auctionsDB.find(item => item.id === parseInt(id))
    }

};

export default Auction;