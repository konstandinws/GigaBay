import CommentService from "../Services/commentService.js";

export default function auctionSocket(io) {
    io.on("connection", (socket) => {

        // Rejoindre la salle d'une enchère spécifique
        socket.on("join_auction", async (auctionId) => {
            socket.join(`auction_${auctionId}`);
            
            // Envoyer l'historique des messages à celui qui vient d'arriver
            try {
                const history = await CommentService.getComments(auctionId);
                socket.emit("load_history", history);
            } catch (err) {
                console.error("Erreur chargement historique:", err);
            }
        });

        // 2. Réception d'un message
        socket.on("send_message", async (data) => {
            // data = { auctionId, userId, username, message }
            try {
                // Sauvegarde en BDD via le Service
                const savedComment = await CommentService.addComment(data);

                // Diffusion à TOUS les gens sur cette enchère
                io.to(`auction_${data.auctionId}`).emit("receive_message", savedComment);
                
            } catch (err) {
                console.error("Erreur envoi message:", err);
                socket.emit("error", "Impossible d'envoyer le message");
            }
        });

        socket.on("disconnect", () => {
        });
    });
}