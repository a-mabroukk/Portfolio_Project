import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditProfile = () => {
    const { profileId } = useParams();
    const [profile, setProfile] = useState({
        name: '',
        username: '',
        bio: '',
        gmail: '',
        facebook: '',
        instagram: '',
        x: '',
        linkedin: '',
        github: '',
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
                const response = await axios.get(`http://127.0.0.1:5000/update-profile?profile_to_update=${profileId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProfile(response.data);
                console.log("Profile ID:", profileId);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    console.error("Error fetching profile:", error);
                    //navigate("/login");
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
    }, [profileId, navigate, token]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        
        for (const key in profile) {
            formData.append(key, profile[key]);
        }
    
        try {
            setLoading(true);
            // Ensure profileId is defined and properly formatted
            await axios.post(`http://127.0.0.1:5000/update-profile/${profileId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Profile ID:", profileId);
            alert("Profile updated successfully!");
            navigate(`/profile/${profileId}`);
        } catch (error) {
            console.error("Error updating profile:", error);
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
                <div className={`alert alert-${flashMessage.type}`}>{flashMessage.message}</div>)}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div>
                    <label>Name</label>
                    <input type="text" name="name" value={profile.name} onChange={handleChange} />
                    {errors.name && <div className="error">{errors.name}</div>}
                </div>
                <div>
                    <label>Username</label>
                    <input type="text" name="username" value={profile.username} onChange={handleChange} />
                    {errors.username && <div className="error">{errors.username}</div>}
                </div>
                <div>
                    <label>Bio</label>
                    <textarea name="bio" value={profile.bio} onChange={handleChange}></textarea>
                    {errors.bio && <div className="error">{errors.bio}</div>}
                </div>
                <div>
                    <label>Gmail</label>
                    <input type="text" name="gmail" value={profile.gmail} onChange={handleChange} />
                    {errors.gmail && <div className="error">{errors.gmail}</div>}
                </div>
                <div>
                    <label>Facebook</label>
                    <input type="text" name="facebook" value={profile.facebook} onChange={handleChange} />
                    {errors.facebook && <div className="error">{errors.facebook}</div>}
                </div>
                <div>
                    <label>Instagram</label>
                    <input type="text" name="instagram" value={profile.instagram} onChange={handleChange} />
                    {errors.instagram && <div className="error">{errors.instagram}</div>}
                </div>
                <div>
                    <label>X (formerly Twitter)</label>
                    <input type="text" name="x" value={profile.x} onChange={handleChange} />
                    {errors.x && <div className="error">{errors.x}</div>}
                </div>
                <div>
                    <label>LinkedIn</label>
                    <input type="text" name="linkedin" value={profile.linkedin} onChange={handleChange} />
                    {errors.linkedin && <div className="error">{errors.linkedin}</div>}
                </div>
                <div>
                    <label>GitHub</label>
                    <input type="text" name="github" value={profile.github} onChange={handleChange} />
                    {errors.github && <div className="error">{errors.github}</div>}
                </div>
                <div>
                    <label>Profile Picture</label>
                    <input type="file" name="picture" onChange={handleChange} />
                    {errors.picture && <div className="error">{errors.picture}</div>}
                </div>
                <button type="submit" disabled={loading}>Save Changes</button>
            </form>
        </div>
    );
};

export default EditProfile;
