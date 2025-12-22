import User from "../models/User.js"

class profileService{

    static async getProfile(userId){
       const user = await User.findById(userId);

       const { password: _, ...userWithoutPassword } = user;

       return userWithoutPassword;
    }
}

export default profileService;