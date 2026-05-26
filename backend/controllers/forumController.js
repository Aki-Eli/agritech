/**
 * Forum controller.
 * Manages community forum posts and comments.
 * Uses manual nested population for comments since Mongoose's nested populate
 * requires explicit path configuration on the schema.
 */
const ForumPost = require('../models/ForumPost');
const User = require('../models/User');

/**
 * Populates the userId field on each comment with the author's name.
 * @param {object[]} comments - raw comment objects from a post
 * @returns {Promise<object[]>} comments with userId replaced by { _id, name }
 */
const populateCommentAuthors = async (comments) => {
  return Promise.all(comments.map(async (comment) => {
    if (comment.userId) {
      const user = await User.findById(comment.userId).select('name').lean();
      comment.userId = user || { name: 'Unknown' };
    }
    return comment;
  }));
};

/**
 * GET /api/forum
 * Returns all forum posts with author names and populated comment authors, newest first.
 */
exports.getPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const populatedPosts = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        comments: await populateCommentAuthors(post.comments || [])
      }))
    );

    res.json(populatedPosts);
  } catch (err) {
    console.error('getPosts error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * POST /api/forum
 * Creates a new forum post for the authenticated user.
 */
exports.createPost = async (req, res) => {
  try {
    const post = new ForumPost({ ...req.body, userId: req.user.id });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error('createPost error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * POST /api/forum/:postId/comments
 * Adds a comment to an existing post and returns the updated post with all authors populated.
 */
exports.addComment = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    post.comments.push({ userId: req.user.id, text: req.body.text });
    await post.save();

    const postObj = post.toObject();
    postObj.comments = await populateCommentAuthors(postObj.comments);

    const postAuthor = await User.findById(postObj.userId).select('name').lean();
    postObj.userId = postAuthor || postObj.userId;

    res.json(postObj);
  } catch (err) {
    console.error('addComment error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * DELETE /api/forum/:id
 * Deletes a forum post.
 */
exports.deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    res.json({ msg: 'Post deleted successfully' });
  } catch (err) {
    console.error('deletePost error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
