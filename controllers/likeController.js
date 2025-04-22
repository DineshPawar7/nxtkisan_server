const Post = require('../models/Post');

const likePost = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    if (post.likes.includes(userId)) {
     
       res.json({ message: 'Post already liked', likes: post.likes });
       return;
    }

    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } },
        { new: true }
    ).populate('likes', 'username');

    res.json({ message: 'Post liked successfully', likes: updatedPost.likes });

  } catch (error) {
    next(error);
  }
};


const unlikePost = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    if (!post.likes.includes(userId)) {
      
       res.json({ message: 'Post was not liked', likes: post.likes });
       return;
    }

    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } },
        { new: true }
    ).populate('likes', 'username');

    res.json({ message: 'Post unliked successfully', likes: updatedPost.likes });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  likePost,
  unlikePost,
};