const express = require('express');
const { getPosts, createPost, addComment, deletePost } = require('../controllers/forumController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getPosts);
router.post('/', auth, createPost);
router.post('/:postId/comments', auth, addComment);
router.delete('/:id', auth, deletePost);

module.exports = router;