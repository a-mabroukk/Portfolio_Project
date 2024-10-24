import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  // const { profileId } = useParams();
  const [profile_to_update, setProfile] = useState({
    name: "",
    username: "",
    bio: "",
    gmail_links: "",
    facebook_links: "",
    instagram_links: "",
    x_links: "",
    linkedin_links: "",
    github_links: "",
    picture: null,
  });
  const [errors, setErrors] = useState({});
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flashMessage, setFlashMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/update-profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfile(response.data.profile);
        // console.log("Profile ID:", profileId);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.error("Error fetching profile:", error);
          navigate("/login");
        } else {
          setFlashMessage({
            type: "danger",
            message:
              "Profile not found or you do not have permission to modify.",
          });
          navigate("/home");
        }
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [navigate, token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      // Ensure profileId is defined and properly formatted
      await axios.post("http://127.0.0.1:5000/update-profile/", profile_to_update, {
          headers: {
            "Content-Type": "multipart/form-data",
            // "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => console.log(response))
        .catch((error) => console.error("Error updating profile:", error));
    //   console.log(response.data);
      // console.log("Profile ID:", profileId);
      alert("Profile updated successfully!");
      navigate(`/profile`);
    } catch (error) {
      console.error("Error updating profile:", error.message);
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Flash Messages */}
      {flashMessage && (
        <div className={`alert alert-${flashMessage.type}`}>
          {flashMessage.message}
        </div>
      )}
      <form method="POST" onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={profile_to_update.name || ""}
            onChange={handleChange}
          />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>
        <div>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={profile_to_update.username || ""}
            onChange={handleChange}
          />
          {errors.username && <div className="error">{errors.username}</div>}
        </div>
        <div>
          <label>Bio</label>
          <textarea
            name="bio"
            value={profile_to_update.bio || ""}
            onChange={handleChange}
          ></textarea>
          {errors.bio && <div className="error">{errors.bio}</div>}
        </div>
        <div>
          <label>Gmail</label>
          <input
            type="text"
            name="gmail_links"
            value={profile_to_update.gmail_links || ""}
            onChange={handleChange}
          />
          {errors.gmail_links && (
            <div className="error">{errors.gmail_links}</div>
          )}
        </div>
        <div>
          <label>facebook</label>
          <input
            type="text"
            name="facebook_links"
            value={profile_to_update.facebook_links || ""}
            onChange={handleChange}
          />
          {errors.facebook_links && (
            <div className="error">{errors.facebook_links}</div>
          )}
        </div>
        <div>
          <label>instagram</label>
          <input
            type="text"
            name="instagram_links"
            value={profile_to_update.instagram_links || ""}
            onChange={handleChange}
          />
          {errors.instagram_links && (
            <div className="error">{errors.instagram_links}</div>
          )}
        </div>
        <div>
          <label>X (formerly Twitter)</label>
          <input
            type="text"
            name="x_links"
            value={profile_to_update.x_links || ""}
            onChange={handleChange}
          />
          {errors.x_links && <div className="error">{errors.x_links}</div>}
        </div>
        <div>
          <label>linkedin</label>
          <input
            type="text"
            name="linkedin_links"
            value={profile_to_update.linkedin_links || ""}
            onChange={handleChange}
          />
          {errors.linkedin_links && (
            <div className="error">{errors.linkedin_links}</div>
          )}
        </div>
        <div>
          <label>github_links</label>
          <input
            type="text"
            name="github_links"
            value={profile_to_update.github_links || ""}
            onChange={handleChange}
          />
          {errors.github_links && (
            <div className="error">{errors.github_links}</div>
          )}
        </div>
        <div>
          <label>profile_to_update Picture</label>
          <input type="file" name="picture" onChange={handleChange} />
          {errors.picture && <div className="error">{errors.picture}</div>}
        </div>
        <button type="submit" disabled={loading}>
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
