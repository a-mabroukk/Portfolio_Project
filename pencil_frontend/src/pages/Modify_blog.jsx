import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ModifyPost = () => {
  const { postId } = useParams(); // Assuming you're using React Router for dynamic routing
  const [post, setPost] = useState({ title: "", content: "" });
  const [errors, setErrors] = useState({});
  const [flashMessage, setFlashMessage] = useState(null);
  const navigate = useNavigate();

  // Fetch post data on mount
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/modify?post_id=${postId}`);
        setPost(response.data.post);
      } catch (error) {
        setFlashMessage({ type: "danger", message: "Blog post not found or you do not have permission to modify." });
        navigate("/home");
      }
    };

    fetchPost();
  }, [postId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost((prevPost) => ({
      ...prevPost,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://127.0.0.1:5000/modify?post_id=${postId}`, post);
      setFlashMessage({ type: "success", message: "Blog has been updated successfully!" });
      navigate(`/blog/${postId}`); // Redirect to the blog page after successful modification
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors); // Backend validation errors
      } else {
        setFlashMessage({ type: "danger", message: "An error occurred while updating the post." });
      }
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Modify Blog Post</h1>

      {/* Flash Messages */}
      {flashMessage && (
        <div className={`alert alert-${flashMessage.type}`}>
          {flashMessage.message}
        </div>
      )}

      <form method="POST" onSubmit={handleSubmit}>
        {/* Title Field */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={post.title}
            onChange={handleChange}
            required
          />
          {errors.title && <div className="text-danger">{errors.title}</div>}
        </div>

        {/* Content Field */}
        <div className="form-group">
          <label htmlFor="content" className="form-label">Content</label>
          <textarea
            className="form-control"
            id="content"
            name="content"
            rows="5"
            value={post.content}
            onChange={handleChange}
            required
          ></textarea>
          {errors.content && <div className="text-danger">{errors.content}</div>}
        </div>

        {/* Submit and Cancel Buttons */}
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(`/blog/${postId}`)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default ModifyPost;
