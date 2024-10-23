import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import PropTypes from "prop-types";

const BlogPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState({});
  const [childReplyText, setChildReplyText] = useState({});
  const [saveMessage, setSaveMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // To track loading state
  const [error, setError] = useState(null); // To track errors
  const [token, setToken] = useState(null);


  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Fetch blog and comments on mount
  useEffect(() => {
    const fetchBlogAndComments = async () => {
      setIsLoading(true); // Set loading state before making API call
      setError(null); // Reset any previous error

      try {
        if (!postId || !token) {
          throw new Error("Missing postId or token.");
        }

        const response = await axios.get(
          `http://127.0.0.1:5000/blog?post_id=${postId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data) {
          console.log("Blog and comments fetched successfully.", response.data);
          setBlog(response.data.post);
          setComments(response.data.comments || []);
        } else {
          throw new Error("No blog data received.");
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // If unauthorized, redirect to the login page
          navigate("/login");
        }
        console.error("Error fetching blog and comments:", error.message);
        setError(error.message || "Error fetching blog and comments.");
      } finally {
        setIsLoading(false); // Ensure loading state is set to false even on error
      }
    };
    if (token && postId) {
      fetchBlogAndComments(); // Fetch data if token and postId are valid
    }
  }, [postId, token]);

  // Fetch comments
  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/blog?post_id=${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(response.data.comments || []);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
      console.error("Error fetching comments:", error);
      console.error(
        "Error fetching blog and comments:",
        error.response || error.message
      );

      setError("Error fetching comments.");
    }
  };

  // Add comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!commentText.trim()) return;

      await axios.post(
        `http://127.0.0.1:5000/blog?post_id=${postId}`,
        { comment: commentText },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCommentText("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Error adding comment.");
    }
  };

  // Add reply to a comment
  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    console.log("commentId", commentId);
    try {
      if (!replyText[commentId]?.trim()) return;
      await axios.post(
        `http://127.0.0.1:5000/blog?post_id=${postId}`,
        {
          reply: replyText[commentId],
          comment_id: commentId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReplyText({ ...replyText, [commentId]: "" });
      fetchComments();
    } catch (error) {
      console.error("Error adding reply:", error);
      setError("Error adding reply.");
    }
  };

  // Add reply to a reply (child reply)
  const handleChildReplySubmit = async (e, replyId) => {
    e.preventDefault();
    try {
      if (!childReplyText[replyId]?.trim()) return;

      await axios.post(
        `http://127.0.0.1:5000/blog?post_id=${postId}`,
        {
          reply_reply: childReplyText[replyId],
          reply_id: replyId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setChildReplyText({ ...childReplyText, [replyId]: "" });
      fetchComments();
    } catch (error) {
      console.error("Error adding child reply:", error);
      setError("Error adding child reply.");
    }
  };

  // Save blog
  const handleSaveBlog = async () => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/blog/save?post_id=${postId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSaveMessage(response.data.message);
    } catch (error) {
      console.error("Error saving blog:", error);
      setError("Error saving blog.");
    }
  };

  // Edit blog
  const handleEditBlog = () => {
    navigate(`/modify/${postId}`); // Redirect to the modify page
  };
  
  

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Blog Post */}
      {blog && (
        <div className="blog-post">
          <h1>{blog.title}</h1>
          <p>{blog.content}</p>
          <button onClick={handleSaveBlog} className="btn btn-success">
            Save Blog
          </button>
          {saveMessage && <p>{saveMessage}</p>}
          <button onClick={handleEditBlog} className="btn btn-primary">
            Edit Blog
          </button>
        </div>
      )}

      {/* Comments Section */}
      <div className="comments-section">
        <h3>Comments</h3>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <p>
                <strong>{comment.comment_owner}</strong>: {comment.text}
              </p>
              <small>
                {new Date(comment.publication_date).toLocaleString()}
              </small>

              {/* Reply Form */}
              <form onSubmit={(e) => handleReplySubmit(e, comment.id)}>
                <textarea
                  value={replyText[comment.id] || ""}
                  onChange={(e) =>
                    setReplyText({ ...replyText, [comment.id]: e.target.value })
                  }
                  placeholder="Write a reply..."
                />
                <button type="submit">Reply</button>
              </form>

              {/* Replies to Comment */}
              {comment.replies &&
                comment.replies.map((reply) => (
                  <div key={reply.id} className="reply">
                    <p>
                      <strong>{reply.responder}</strong>: {reply.text}
                    </p>
                    <small>
                      {new Date(reply.publication_date).toLocaleString()}
                    </small>

                    {/* Child Reply Form */}
                    <form onSubmit={(e) => handleChildReplySubmit(e, reply.id)}>
                      <textarea
                        value={childReplyText[reply.id] || ""}
                        onChange={(e) =>
                          setChildReplyText({
                            ...childReplyText,
                            [reply.id]: e.target.value,
                          })
                        }
                        placeholder="Write a reply to this reply..."
                      />
                      <button type="submit">Reply</button>
                    </form>

                    {/* Child Replies */}
                    {reply.replies &&
                      reply.replies.map((childReply) => (
                        <div key={childReply.id} className="child-reply">
                          <p>
                            <strong>{childReply.child_reply_owner}</strong>:{" "}
                            {childReply.text}
                          </p>
                          <small>
                            {new Date(
                              childReply.publication_date
                            ).toLocaleString()}
                          </small>
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}

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
    </div>
  );
};

BlogPage.propTypes = {
  token: PropTypes.string.isRequired,
};

export default BlogPage;
