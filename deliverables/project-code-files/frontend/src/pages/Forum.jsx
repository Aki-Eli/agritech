import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUsers, FaCommentAlt, FaPaperPlane, FaPlus, FaClock, FaUser } from 'react-icons/fa';
import axios from 'axios';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [commentText, setCommentText] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    try {
      const res = await axios.get('/api/forum');
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    setSubmitting(true);
    try {
      await axios.post('/api/forum', newPost);
      setNewPost({ title: '', content: '' });
      setShowForm(false);
      loadPosts();
      setMessage('Post published successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Error creating post');
    }
    setSubmitting(false);
  };

  const addComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    try {
      await axios.post(`/api/forum/${postId}/comments`, { text });
      setCommentText({ ...commentText, [postId]: '' });
      loadPosts();
    } catch (err) {
      alert('Error adding comment');
    }
  };

  const initials = (name) =>
    name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Community Forum</h2>
          <p>Share knowledge, ask questions, and learn from fellow farmers.</p>
        </div>
        <Button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <FaPlus /> New Post
        </Button>
      </div>

      {message && <Alert variant="success" className="mb-3">{message}</Alert>}

      {/* New Post Form */}
      {showForm && (
        <Card className="dashboard-card mb-4" style={{ border: '1.5px solid var(--primary)' }}>
          <Card.Body style={{ padding: '1.5rem' }}>
            <h5 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '.9rem' }}>Start a Discussion</h5>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                placeholder="What's your question or topic?"
                value={newPost.title}
                onChange={e => setNewPost({ ...newPost, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Share your experience, question, or tip in detail..."
                value={newPost.content}
                onChange={e => setNewPost({ ...newPost, content: e.target.value })}
              />
            </Form.Group>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <Button className="btn btn-primary" onClick={createPost} disabled={submitting}>
                {submitting ? <Spinner animation="border" size="sm" /> : <><FaPaperPlane /> Publish Post</>}
              </Button>
              <Button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Posts */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Spinner animation="border" style={{ color: 'var(--primary)' }} />
        </div>
      ) : posts.length === 0 ? (
        <Card className="dashboard-card" style={{ border: 'none' }}>
          <Card.Body style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <FaUsers style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h5 style={{ color: 'var(--text-secondary)' }}>No posts yet</h5>
            <p style={{ color: 'var(--text-muted)', fontSize: '.83rem' }}>Be the first to start a discussion.</p>
            <Button className="btn btn-primary mt-2" onClick={() => setShowForm(true)}>
              <FaPlus /> Create First Post
            </Button>
          </Card.Body>
        </Card>
      ) : (
        posts.map(post => (
          <div key={post._id} className="forum-post mb-3">
            {/* Post Header */}
            <div className="forum-post-header">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'var(--primary-pale)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '.78rem', flexShrink: 0
                }}>
                  {initials(post.userId?.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <h5 style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '.15rem', color: 'var(--text-primary)' }}>
                    {post.title}
                  </h5>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '.72rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                      <FaUser /> {post.userId?.name || 'Farmer'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                      <FaClock /> {timeAgo(post.createdAt)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                      <FaCommentAlt /> {post.comments?.length || 0} comments
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Body */}
            <div className="forum-post-body">
              <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
                {post.content}
              </p>
            </div>

            {/* Comments */}
            {post.comments?.length > 0 && (
              <div style={{ padding: '.5rem 1.25rem', background: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}>
                {post.comments.map((c, i) => (
                  <div key={i} className="forum-comment">
                    <div className="comment-avatar">{initials(c.userId?.name)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.2rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '.78rem', color: 'var(--text-primary)' }}>
                          {c.userId?.name || 'Farmer'}
                        </span>
                        <span style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>
                          {timeAgo(c.createdAt)}
                        </span>
                      </div>
                      <p style={{ fontSize: '.8rem', color: 'var(--text-secondary)', margin: 0 }}>{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Input */}
            <div style={{ padding: '.75rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '.5rem' }}>
              <Form.Control
                size="sm"
                placeholder="Write a comment..."
                value={commentText[post._id] || ''}
                onChange={e => setCommentText({ ...commentText, [post._id]: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addComment(post._id)}
                style={{ borderRadius: 'var(--radius-md)' }}
              />
              <Button
                className="btn btn-primary btn-sm"
                onClick={() => addComment(post._id)}
                disabled={!commentText[post._id]?.trim()}
              >
                <FaPaperPlane />
              </Button>
            </div>
          </div>
        ))
      )}
    </>
  );
};

export default Forum;
