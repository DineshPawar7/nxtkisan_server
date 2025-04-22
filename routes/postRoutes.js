const express = require('express');
const { createPost, getPosts } = require('../controllers/postController');
const { addComment, getComments } = require('../controllers/commentController');
const { likePost, unlikePost } = require('../controllers/likeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, upload.single('media'), createPost)
  .get(getPosts);

router.route('/:postId/comments')
  .post(protect, addComment)
  .get(getComments);

router.route('/:postId/like')
  .post(protect, likePost)  
  .delete(protect, unlikePost); 

module.exports = router;