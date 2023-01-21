import mongoose from 'mongoose';
import PostHaiku from '../models/postHaiku.js'
import Profile from '../models/profile.js';
import cloudinary from '../middleware/cloudinary.js'

export const getPosts = async (req, res) => {
  //  const { page } = req.query;
    try {
      
    
      //  const LIMIT = 10;
      //  const startIndex = (Number(page) - 1) * LIMIT; //get the starting index of every page
      //  const total = await PostHaiku.countDocuments({})
      //  const posts = await PostHaiku.find().sort({ id: -1 }).limit(LIMIT).skip(startIndex );
      const PAGE_SIZE = 5;
      const page = parseInt(req.query.page);
      const totalPosts = await PostHaiku.countDocuments({});
     
      let posts = await PostHaiku.find().lean()
      .sort({ _id: -1 })
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page);
       
       res.status(200).json({totalPages: Math.ceil(totalPosts / PAGE_SIZE), posts: posts});
      //  res.status(200).json({ data: posts, currentPage: Number(page), numberOfPage: Math.ceil( total / LIMIT ) })
    } catch (error) {
        
        res.status(404).json( { message: error.message })
    }
}

export const getPostsBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query;

  try {
    const text = new RegExp(searchQuery, 'i');
    console.log('title is' + text)
    const posts = await PostHaiku.find({ $or: [ { text }, { tags: { $in: tags.split(',')}}]})
      .sort({ _id: -1 })
      .lean()
    console.log('this is posts' + posts)
    res.json({ data: posts });
  } catch (error) {
     res.status(404).json({ message: error.message })
  }
}
export const createPost = async (req, res) => {
  //receive from frontend
   const post = req.body;
   let image = null
   console.log('post' + JSON.stringify(post))
   //upload image to cloduniary
   if(post?.selectedFile){
    image = await cloudinary.uploader.upload(post.selectedFile);
   }
 
   const newPost = new PostHaiku({
    // ...post, 
  
    creator: req.userId, 
    username: post.username,
    profileIconImg: post.profileIconImg,
    // name: post.name,
    text: post.text,
    tags: post.tags,
    likes: post.likes,
    selectedFile: image?.secure_url,
    comments: post.comments,
    cloudinaryId: image?.public_id,  
    createdAt: new Date().toISOString()})
  //  const posts = await PostHaiku.find()..sort({ _id: -1 });
  // let posts = await PostHaiku.find().sort({ _id: -1 });
   try {
     await newPost.save();

     res.status(201).json(newPost);

   } catch (error) {
     
    res.status(409).json( { message: error.message })
   }
}

export const updatePost = async (req, res) => {
  const { id } = req.params;
    //receive from frontend
  const post = req.body;
  let newImage;
  if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("no post with that id");
  
  if(post?.selectedFile){

    let oldPost = await PostHaiku.findById(id);

    //delete image from cloudinary
    if(oldPost?.cloudinaryId){
      await cloudinary.uploader.destroy(oldPost?.cloudinaryId);
    }

    //upload new image to cloudinary
    newImage = await cloudinary.uploader.upload(post.selectedFile);
  }

 
  const updatedPost = await PostHaiku.findByIdAndUpdate(id, {
    ...post,   
    selectedFile: newImage?.secure_url,
    cloudinaryId: newImage?.public_id,
    editedAt: new Date().toISOString()
     },   
    {new: true})
  .sort({ _id: -1 })
  .lean()
  ;
 console.log(`this is updated post ${updatedPost}`)
  res.json(updatedPost);
}

export const deletePost = async (req, res) => {
  const { id } = req.params;
  
  if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("no post with that id");
  let post = await PostHaiku.findById(id);

  //delte image from cloudinary
  if(post?.cloudinaryId){
  await cloudinary.uploader.destroy(post.cloudinaryId);
  }

  await PostHaiku.findByIdAndRemove(id);

  res.json({ message: 'Post delete successfully '})
}

export const likePost = async (req, res) => {
  const { id } = req.params;
  
  const userId = req.userId;
   //req.userId is from authMiddleware
  if(!userId) return res.json({ message: 'Unauthenticated.'})

  if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("no post with that id");

  const post = await PostHaiku.findById(id).lean();
  const loggedInUser = await Profile.findOne({userId}).lean();
  const index = post.likes.findIndex((user) => user.userId === String(userId));

  if(index === -1) {
    //like the post
    post.likes.push({
          userId: loggedInUser.userId,
          username: loggedInUser.username,
          profileIconImg: loggedInUser.profileIconImg,
          bio: loggedInUser.bio,
    });
  }else {
    //dislike the post
    post.likes = post.likes.filter((user) => user.userId !== String(userId));
  }

  const updatedPost = await PostHaiku.findByIdAndUpdate(id, post, {new : true}).lean();
  console.log('this is updated' + updatedPost)
  res.json(updatedPost)
}

export const getPost = async (req, res) => {
  const { id } = req.params;
  
   //req.userId is from authMiddleware
  // if(!req.userId) return res.json({ message: 'Unauthenticated.'})

  if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("no post with that id");

  const post = await PostHaiku.findById(id).lean();

  res.json(post)
}

export const commentPost = async (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  const {commentorIconImg} = req.body;

  console.log('value is ' + value)
  

  const post = await PostHaiku.findById(id).lean();

  post.comments.push({value:value, userId:req.userId, commentorIconImg: commentorIconImg, createdAt: new Date().toISOString()});

  const updatedPost = await PostHaiku.findByIdAndUpdate(id, post, { new: true }).lean();

  console.log('updated post is ' + JSON.stringify(updatedPost))
  res.json(updatedPost)
}

export const getUserPosts = async (req, res) => {
  
  const { creator } = req.params;
  console.log('creator is ' + creator)
  try {

    const PAGE_SIZE = 5;
    const page = parseInt(req.query.page);
    const totalPosts = await PostHaiku.countDocuments({"creator" : creator });
   
   console.log('total is' + totalPosts)
    const posts = await PostHaiku.find({ "creator" : creator })
    .sort({ _id: -1 })
    .limit(PAGE_SIZE)
    .skip(PAGE_SIZE * page);
     
     res.status(200).json({totalPages: Math.ceil(totalPosts / PAGE_SIZE), posts, totalPosts });

    console.log('dispatched this is posts' + JSON.stringify(posts))
  
  } catch (error) {
     res.status(404).json({ message: error.message })
  }
}

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const  {commentId}  = req.body;

  const post = await PostHaiku.findById(id).lean();
  

  post.comments = post.comments.filter(comment =>  comment._id != String(commentId));

  const updatedPost = await PostHaiku.findByIdAndUpdate(id, post, { new: true }).lean();
  console.log('comments ' + JSON.stringify(updatedPost))
  res.json(updatedPost)
}

// export const editComment = async (req, res) => {
//   const { id } = req.params;
//   const { commentId }  = req.body;
 
//   const post = await PostHaiku.findById(id).lean();
  

//   post.comments = post.comments.map(comment =>  comment._id == String(commentId) ? );

//   const updatedPost = await PostHaiku.findByIdAndUpdate(id, post, { new: true }).lean();

//   res.json(updatedPost)
// }