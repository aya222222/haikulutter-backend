import mongoose from "mongoose";

const profileSchema = mongoose.Schema({
    userId: String,
    username: String,
    profileBgImg:  String,
    profileIconImg: String,
    cloudinaryIconId : String, 
    cloudinaryBgId : String, 
    bio: String,
    totalPosts: Number,
    follower:[{
        userId: String,
        username:String,
        profileIconImg: String,
        bio: String,
      }],
    following:[{
        userId: String,
        username:String,
        profileIconImg: String,
        bio: String,
      }]
      
})



const Profile = mongoose.model('Profile', profileSchema);

export default Profile;