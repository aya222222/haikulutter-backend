import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    
    text: String,
    creator: String,
    username: String,
    profileIconImg: String,
    // name: String,
    tags: [String],
    cloudinaryId: String,
    selectedFile: String,
    likes:[{
        userId: String,
        username:String,
        profileIconImg: String,
        bio: String,
      }],
    comments:  [{
        userId: String,
        value: String, 
        commentorIconImg: String, 
        createdAt: {
        type: Date,
        default: new Date()
    },  
        editedAt: {
        type: Date,
        // default: new Date()
    },
}],
    createdAt: {
        type: Date,
        default: new Date()
    },
    editedAt: {
        type: Date,
        // default: new Date()
    },

})

const PostHaiku = mongoose.model('PostHaiku', postSchema);

export default PostHaiku;