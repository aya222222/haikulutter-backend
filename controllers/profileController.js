import mongoose from 'mongoose';
import Profile from '../models/profile.js'
import PostHaiku from '../models/postHaiku.js';
import cloudinary from '../middleware/cloudinary.js'

export const getProfile = async (req, res) => {
    // const { userId } = req.params;

  
    console.log(`hi! userId is ${req.userId}`)

      

        try {
          const userId = req.userId;
          console.log(`again ${userId}`);
          const totalPosts = await PostHaiku.countDocuments({"creator" : userId });
          const existingUser = await Profile.findOne({userId}).lean();
          console.log('loggedin user is ' + existingUser)
        // if(existingUser){
          console.log('total is ' + totalPosts)
          res.status(200).json({...existingUser, totalPosts})
          
        } catch (error) {
          res.status(500).json({ message: "something went wrong"})
          
        }
      // }else{
      //   res.status(400).json({message: "No profiles"});
      //   console.log('no profile')
      // }
    


  }

  export const createProfile = async (req, res) => {
    // const { userId } = req.params;
    const userId = req.userId;
    const profileData = req.body;
    let bgImg;
    let iconImg;

    console.log(  profileData.profileIconImg + 'bio is ')

    
    try {
      if(profileData?.profileBgImg || profileData?.profileIconImg ){
        console.log('image contained')
    
        bgImg = await cloudinary.uploader.upload(profileData?.profileBgImg, {timeout:120000}, function(error,result){});
        iconImg = await cloudinary.uploader.upload(profileData?.profileIconImg, {timeout:120000}, function(error,result){});
       }
     
       
       console.log('try!!')
      } catch (error) {
        console.log(error)
      }
      
      console.log('first ' )
      const newProfile = new Profile({
        ...profileData, 
        profileBgImg: bgImg?.secure_url,
        profileIconImg: iconImg?.secure_url,
        cloudinaryIconId: iconImg?.public_id,  
        cloudinaryBgId: bgImg?.public_id,  
        userId: userId
      });
      
      console.log('second ' )
      
      try {
        console.log('third ' )
        res.status(201).json(newProfile);
         await newProfile.save();
       } catch (error) {
        res.status(409).json( { message: error.message })
       }
  } 

  export const updateProfile = async (req, res) => {
    const { id } = req.params;

      //receive from frontend
    const profileData = await req.body;
    console.log('profiledata is ' + JSON.stringify(profileData))
    let newIconImg;
    let newBgImg;
    const userId = req.userId;
    const oldProfile = await Profile.findOne({userId}).lean();
 
    console.log(  'new profile is ')
    if(!mongoose.Types.ObjectId.isValid(oldProfile._id)) return res.status(404).send("no profile with that id");
    
    // let oldProfile = await Profile.findById(id);
          
  
 
   try {
    console.log('inside of try')
       //if you change Icon image
       if(profileData?.profileIconImg !== oldProfile?.profileIconImg){
         console.log('first update')
        //delete icon image from cloudinary
        if(oldProfile?.cloudinaryIconId){
          await cloudinary.uploader.destroy(oldProfile.cloudinaryIconId);
        }
  
       //upload new icon image to cloudinary
       console.log('second update')
       newIconImg = await cloudinary.uploader.upload(profileData.profileIconImg, {timeout:120000}, function(error,result){});
       console.log('third update')
      }
      
        //if you change bg image
      if(profileData?.profileBgImg !== oldProfile.profileBgImg){
        console.log('4 update')
        //delete bg image from cloudinary
       await cloudinary.uploader.destroy(oldProfile.cloudinaryBgId);
  
       //upload new bg image to cloudinary
       newBgImg = await cloudinary.uploader.upload(profileData.profileBgImg, {timeout:120000}, function(error,result){});
       console.log('5 update')
      }
     
  
      const updatedProfile = await Profile.findByIdAndUpdate(
        oldProfile._id, 
        {...profileData, 
         profileIconImg: newIconImg?.secure_url,
         profileBgImg: newBgImg?.secure_url,
         cloudinaryIconId: newIconImg?.public_id,  
         cloudinaryBgId: newBgImg?.public_id, 
         
        },
         {new: true}
         ).lean()
        console.log('profile updated')
        res.status(201).json(updatedProfile);

      } catch (error) {
        res.status(409).json( { message: error.message })
      }

    
  }

  export const getCreatorProfile = async (req, res) => {
    const { creator } = req.params;

    try {
   
      const creatorProfile = await Profile.findOne({userId : creator}).lean();
    
      if(creatorProfile){
     
        res.status(200).json(creatorProfile)
        console.log('creatorProfile is' + creatorProfile)
      }else{
        res.status(400).json({message: "No profiles"});
      }
    
    } catch (error) {
      res.status(500).json({ message: "something went wrong"})
    }
  }

  export const followOrUnfollowCreator = async (req, res) => {
    const { creator } = req.params;
    const userId = req.userId;
     //req.userId is from authMiddleware
    if(!userId) return res.json({ message: 'Unauthenticated.'})
  
    try {
      const loggedInUser = await Profile.findOne({userId}).lean();
      const targetCreator = await Profile.findOne({userId: String(creator)}).lean();
      const index = loggedInUser.following.findIndex((targetUser) => targetUser.userId == String(creator));
   
      if(index === -1) {
        //follow the creator
        loggedInUser.following.push(
          { 
          userId: targetCreator.userId,
          username: targetCreator.username,
          profileIconImg: targetCreator.profileIconImg,
          bio: targetCreator.bio,
        })
      }else {
        //unfollow the creator
        loggedInUser.following = loggedInUser.following.filter((targetCreator) => targetCreator.userId !== String(creator));
      
  
      }
    
      const updatedLoggedInUserProfile = await Profile.findByIdAndUpdate(loggedInUser._id, loggedInUser, {new : true}).lean();
      
     
      res.json(updatedLoggedInUserProfile)
    } catch (error) {
      res.status(409).json( { message: error.message })
    }
  
  
  }
  
  export const updateCreatorFollowStatus = async (req, res) => {
    const { creator } = req.params;
    //req.userId is from authMiddleware
    const userId = req.userId;
    if(!userId) return res.json({ message: 'Unauthenticated.'})
  
    try {
      // const loggedInUser = await Profile.findOne({userId});
      const creatorProfile = await Profile.findOne({userId : String(creator)}).lean();
      const loggedInUser = await Profile.findOne({userId}).lean();
      const index = creatorProfile.follower.findIndex((user) => user.userId === String(userId));
      if(index === -1) {
        //followed by logged in user
        // loggedInUser.following.push(creator);
      
        creatorProfile.follower.push({
          userId: loggedInUser.userId,
          username: loggedInUser.username,
          profileIconImg: loggedInUser.profileIconImg,
          bio: loggedInUser.bio,
        });
      }else {
        //unfollowed by logged in user 
        // loggedInUser.following = loggedInUser.following.filter((creatorId) => creatorId !== creator);
        creatorProfile.follower = creatorProfile.follower.filter((user) => user.userId !== String(userId));
      }
    
      // const updatedLoggedInUserProfile = await Profile.findByIdAndUpdate(loggedInUser._id, loggedInUser, {new : true}).lean();
      const updatedCreatorProfile = await Profile.findByIdAndUpdate(creatorProfile._id, creatorProfile, {new : true}).lean();
      console.log('follower is ' + creatorProfile.follower)
      res.json(updatedCreatorProfile)
    } catch (error) {
      res.status(409).json( { message: error.message })
    }
  
  
  }
  
  export const updateTargetCreatorFollowStatus = async (req, res) => {
    const { targetCreator } = req.params;
    //req.userId is from authMiddleware
    const userId = req.userId;
    if(!userId) return res.json({ message: 'Unauthenticated.'})
  
    try {
      // const loggedInUser = await Profile.findOne({userId});
      const targetCreatorProfile = await Profile.findOne({userId : String(targetCreator)}).lean();
      const loggedInUser = await Profile.findOne({userId}).lean();
      const index = targetCreatorProfile.follower.findIndex((user) => user.userId === String(userId));
      if(index === -1) {
        //followed by logged in user
        // loggedInUser.following.push(creator);
      
        targetCreatorProfile.follower.push({
          userId: loggedInUser.userId,
          username: loggedInUser.username,
          profileIconImg: loggedInUser.profileIconImg,
          bio: loggedInUser.bio,
        });
      }else {
        //unfollowed by logged in user 
        // loggedInUser.following = loggedInUser.following.filter((creatorId) => creatorId !== creator);
        targetCreatorProfile.follower = targetCreatorProfile.follower.filter((user) => user.userId !== String(userId));
      }
    
      // const updatedLoggedInUserProfile = await Profile.findByIdAndUpdate(loggedInUser._id, loggedInUser, {new : true}).lean();
      const updatedTargetCreatorProfile = await Profile.findByIdAndUpdate(targetCreatorProfile._id, targetCreatorProfile, {new : true}).lean();
      console.log('follower is ' + targetCreatorProfile.follower)
      res.json(updatedTargetCreatorProfile)
    } catch (error) {
      res.status(409).json( { message: error.message })
    }
  
  
  }


