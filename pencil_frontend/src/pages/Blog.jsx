import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";; 

const BlogPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const [blog, setBlog] = useState(null); 
  const [comments, setComments] = useState([]); 
  const [commentText, setCommentText] = useState(""); 
  const [replyText, setReplyText] = useState({}); 
  const [childReplyText, setChildReplyText] = useState({}); 
  const [saveMessage, setSaveMessage] = useState(null);

 // Fetch blog and comments on mount
  useEffect(() => {
    const fetchBlogAndComments = async () => {
      try {
        const blogResponse = await axios.get(`http://127.0.0.1:5000/blog?post_id=${postId}`);
        setBlog(blogResponse.data.post);

        setComments(blogResponse.data.comments);
        // fetchComments();
      } catch (error) {
        console.error("Error fetching blog and comments:", error);
      }
    };

    fetchBlogAndComments();
  }, [postId]);

  // Fetch comments with replies
  const fetchComments = () => {
    axios.get(`http://127.0.0.1:5000/blog?post_id=${postId}`)
      .then(response => {
        console.log("Fetched comments:", response);
        setComments(response.data); // Ensure this matches backend structure
      })
      .catch(error => {
        console.error("Error fetching comments:", error);
      });
  };

  // Add comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting comment:", commentText);
      const response = await axios.post(`http://127.0.0.1:5000/blog?post_id=${postId}`,
        { comment: commentText },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setCommentText("");  // Reset comment text
      fetchComments(response.data || []);     // Fetch updated comments
    } catch (error) {
      console.error("Error adding comment:", error.response ? error.response.data : error.message);
    }
  };

  // Add reply to a comment
  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
  
    try {
      console.log("Submitting reply:", replyText[commentId]);
      const response = await axios.post(`http://127.0.0.1:5000/blog/reply`, { 
        reply: replyText[commentId], 
        comment_id: commentId
      });
      
      // Clear the reply text for the specific comment after successful submission
      setReplyText({ ...replyText, [commentId]: "" });
      
      // Log the fetched response for debugging
      console.log("Fetched comments:", response.data.reply);
  
      // Fetch updated comments after adding a reply
      fetchComments();
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };
  

  // Add reply to a reply (child reply)
  const handleChildReplySubmit = (e, replyId) => {
    e.preventDefault();
    axios.post(`http://127.0.0.1:5000/blog/child_reply`, { reply_reply: childReplyText[replyId], reply_id: replyId })
      .then(() => {
        setChildReplyText({ ...childReplyText, [replyId]: "" });
        fetchComments();
      })
      .catch(error => console.error("Error adding child reply:", error));
  };

  // Save blog
  const handleSaveBlog = () => {
    axios.post(`http://127.0.0.1:5000/blog/save?post_id=${postId}`)
      .then(response => setSaveMessage(response.data.message))
      .catch(error => console.error("Error saving blog:", error));
  };

  const handleEditBlog = () => {
    navigate(`/modify/${postId}`); // Navigate to the edit page for the specific blog post
  };

  if (!blog) return <div>Loading...</div>;

  return (
    <div>
      {/* Blog Post */}
      <div className="blog-post">
        <h1>{blog.title}</h1>
        <p>{blog.content}</p>
        <button onClick={handleSaveBlog} className="btn btn-success">Save Blog</button>
        {saveMessage && <p>{saveMessage}</p>}
        <button onClick={handleEditBlog} className="btn btn-primary">Edit Blog</button> {/* Edit button */}
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h3>Comments</h3>
        {comments.length > 0 ? comments.map(comment => (
          <div key={comment.id} className="comment">
            <p><strong>{comment.comment_owner}</strong>: {comment.text}</p>
            <small>{new Date(comment.publication_date).toLocaleString()}</small>
            {/* Reply Form */}
            <form onSubmit={(e) => handleReplySubmit(e, comment.id)}>
              <textarea
                value={replyText[comment.id] || ""}
                onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                placeholder="Write a reply..."
              />
              <button type="submit">Reply</button>
            </form>

            {/* Replies to Comment */}
            {comment.reply_comments && comment.reply_comments.map(reply => (
              <div key={reply.id} className="reply">
                <p><strong>{reply.responder}</strong>: {reply.text}</p>
                <small>{new Date(reply.publication_date).toLocaleString()}</small>
                {/* Child Reply Form */}
                <form onSubmit={(e) => handleChildReplySubmit(e, reply.id)}>
                  <textarea
                    value={childReplyText[reply.id] || ""}
                    onChange={(e) => setChildReplyText({ ...childReplyText, [reply.id]: e.target.value })}
                    placeholder="Write a reply to this reply..."
                  />
                  <button type="submit">Reply</button>
                </form>

                {/* Child Replies */}
                {reply.replies_on_reply && reply.replies_on_reply.map(childReply => (
                  <div key={childReply.id} className="child-reply">
                    <p><strong>{childReply.child_reply_owner}</strong>: {childReply.text}</p>
                    <small>{new Date(childReply.publication_date).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )) : <p>No comments yet.</p>}

        {/* Add New Comment */}
        <div className="new-comment">
          <h4>Leave a Comment</h4>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment..."
              required
            />
            <button type="submit">Comment Now</button>
          </form>
        </div>
      </div>
      {/* Footer */}
      <footer className="footer">
        <svg className="footer-border" height="214" viewBox="0 0 2204 214" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2203 213C2136.58 157.994 1942.77 -33.1996 1633.1 53.0486C1414.13 114.038 1200.92 188.208 967.765 118.127C820.12 73.7483 263.977 -143.754 0.999958 158.899" strokeWidth="2" />
        </svg>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-5 text-center text-md-left mb-4">
              <ul className="list-inline footer-list mb-0">
                <li className="list-inline-item"><a href="privacy-policy.html">Privacy Policy</a></li>
                <li className="list-inline-item"><a href="terms-conditions.html">Terms Conditions</a></li>
              </ul>
            </div>
            <div className="col-md-2 text-center mb-4">
              <a href="/"><img className="img-fluid" width="100px" src="static/images/logo.png" alt="Reader | Hugo Personal Blog Template" /></a>
            </div>
            <div className="col-md-5 text-md-right text-center mb-4">
              <ul className="list-inline footer-list mb-0">
                <li className="list-inline-item"><a href="#"><i className="ti-facebook"></i></a></li>
                <li className="list-inline-item"><a href="#"><i className="ti-twitter-alt"></i></a></li>
                <li className="list-inline-item"><a href="#"><i className="ti-linkedin"></i></a></li>
                <li className="list-inline-item"><a href="#"><i className="ti-github"></i></a></li>
                <li className="list-inline-item"><a href="#"><i className="ti-youtube"></i></a></li>
              </ul>
            </div>
            <div className="col-12">
              <div className="border-bottom border-default"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;