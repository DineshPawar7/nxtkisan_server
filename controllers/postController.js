const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const path = require('path');
const fs = require('fs');


const createPost = async (req, res, next) => {
  const { caption, mediaType } = req.body;
  const userId = req.user._id;

  try {
    let mediaUrl = null;
    let determinedMediaType = mediaType;

    if (req.file) {
       const fileExtension = path.extname(req.file.originalname).toLowerCase();
       if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) {
            determinedMediaType = 'photo';
       } else if (['.mp4', '.mov', '.avi', '.wmv'].includes(fileExtension)) {
            determinedMediaType = 'video';
       } else {
            
            fs.unlinkSync(req.file.path);
            res.status(400);
            throw new Error('Invalid file type uploaded.');
       }

      mediaUrl = `/uploads/${req.file.filename}`;

      if (mediaType && mediaType !== determinedMediaType) {
          fs.unlinkSync(req.file.path);
          res.status(400);
          throw new Error(`Provided mediaType (${mediaType}) does not match uploaded file type (${determinedMediaType}).`);
      }

    } else if (mediaType === 'photo' || mediaType === 'video') {
        res.status(400);
        throw new Error(`Media file is required for post type '${mediaType}'.`);
    } else if (!mediaType || mediaType === 'text') {
        determinedMediaType = 'text';
    } else {
        res.status(400);
        throw new Error(`Invalid mediaType specified: ${mediaType}. Must be 'text', 'photo', or 'video'.`);
    }


    const post = await Post.create({
      user: userId,
      caption,
      mediaType: determinedMediaType,
      mediaUrl: mediaUrl,
    });

    await User.findByIdAndUpdate(userId, { $push: { posts: post._id } });

    const populatedPost = await Post.findById(post._id).populate('user', 'username profilePicture');


    res.status(201).json(populatedPost);

  } catch (error) {
    if (req.file && req.file.path) {
        try {
            fs.unlinkSync(req.file.path);
            console.log("Cleaned up uploaded file due to error:", req.file.path);
        } catch (cleanupError) {
            console.error("Error cleaning up file:", cleanupError);
        }
    }
    next(error);
  }
};


const getPosts = async (req, res, next) => {
  const pageSize = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  try {
    const count = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('user', 'username profilePicture')
      .populate({ 
            path: 'comments',
            populate: {
                path: 'user',
                select: 'username profilePicture'
            },
            options: { sort: { createdAt: -1 } }
      })
      .populate('likes', 'username');

    res.json({
      posts,
      page,
      pages: Math.ceil(count / pageSize),
      count
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createPost,
  getPosts,
};