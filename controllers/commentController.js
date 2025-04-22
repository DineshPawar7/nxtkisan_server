const Post = require('../models/Post');
const Comment = require('../models/Comment');

const addComment = async (req, res, next) => {
  const { text } = req.body;
  const postId = req.params.postId;
  const userId = req.user._id;

  try {
    if (!text) {
      res.status(400);
      throw new Error('Comment text cannot be empty');
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const comment = await Comment.create({
      user: userId,
      post: postId,
      text,
    });

    post.comments.push(comment._id);
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate('user', 'username profilePicture');

    res.status(201).json(populatedComment);
  } catch (error) {
    next(error);
  }
};

const getComments = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const comments = await Comment.find({ post: postId })
                                 .sort({ createdAt: -1 })
                                 .populate('user', 'username profilePicture');

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addComment,
  getComments,
};