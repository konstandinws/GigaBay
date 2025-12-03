import User from "../models/User.js"

class profileService{

    static async getProfile(userId){
       return await User.findById(userId);
    }
}