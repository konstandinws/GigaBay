import Comment from "../models/Comment.js";

class CommentService {
    static async addComment(data) {
        if (!data.message || !data.userId || !data.auctionId) {
            throw new Error("Données incomplètes");
        }
        // Ici tu pourrais ajouter des vérifications (mots interdits, spam, etc.)
        
        return await Comment.create({
            content: data.message,
            userId: data.userId,
            auctionId: data.auctionId,
            username: data.username
        });
    }

    static async getComments(auctionId) {
        return await Comment.getByAuctionId(auctionId);
    }
}

export default CommentService;