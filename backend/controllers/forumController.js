const ForumPost = require('../models/ForumPost');

exports.getPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Manually populate comments.userId since nested populate can be unreliable
    const User = require('../models/User');
    const populatedPosts = await Promise.all(posts.map(async (post) => {
      const postObj = post.toObject();
      postObj.comments = await Promise.all(postObj.comments.map(async (comment) => {
        if (comment.userId) {
          const user = await User.findById(comment.userId).select('name').lean();
          comment.userId = user || { name: 'Unknown' };
        }
        return comment;
      }));
      return postObj;
    }));

    res.json(populatedPosts);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.createPost = async (req, res) => {
  try {
    const post = new ForumPost({ ...req.body, userId: req.user.id });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    post.comments.push({ userId: req.user.id, text: req.body.text });
    await post.save();

    // Return the post with all names populated
    const User = require('../models/User');
    const postObj = post.toObject();
    postObj.comments = await Promise.all(postObj.comments.map(async (comment) => {
      if (comment.userId) {
        const user = await User.findById(comment.userId).select('name').lean();
        comment.userId = user || { name: 'Unknown' };
      }
      return comment;
    }));
    const postAuthor = await User.findById(postObj.userId).select('name').lean();
    postObj.userId = postAuthor || postObj.userId;

    res.json(postObj);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.deletePost = async (req, res) => {
  try {
    await ForumPost.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Post deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};