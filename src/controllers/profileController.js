import profileService from "../Services/profileService.js"

const getProfile = async (req, res) => {
    try{
        const user = await profileService.getProfile(req.user.id);
        res.json(user)
    } catch(error){
        res.status(400).json({ message: error.message })
    }
}