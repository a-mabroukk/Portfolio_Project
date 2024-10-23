import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const UserProfile = () => {
    const [profile_to_display, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const profileId = new URLSearchParams(window.location.search).get('profile_id'); // Get profile_id from URL
    const [token, setToken] = useState(null);


    useEffect(() => {
        const savedToken = localStorage.getItem("authToken");
            if (savedToken) {
                setToken(savedToken);
            }
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/profile?profile_id=${profileId}`); // Adjust API endpoint
                if (response.data.category === 'success') {
                    setProfile(response.data.profile_to_display);
                } else {
                    setError(response.data.message || "Profile not found.");
                }
            } catch (err) {
                setError("Error fetching profile data. Please try again later.");
                console.error("Profile fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        if (token && profileId) {
            fetchProfile(); // Fetch data if token and postId are valid
          }
    }, [profileId, token]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-danger">{error}</div>;
    if (!profile_to_display) return <div>No profile found.</div>;

    return (
        <div className="container mt-5">
            <section>
                <div>
                    {profile_to_display.profile_picture ? (
                        <img src={`/static/uploads/${profile_to_display.profile_picture}`} alt="profile_to_display" />
                    ) : (
                        <p>No profile_to_display picture uploaded</p>
                    )}
                </div>
                <div>
                    <p className="text-muted">Author: {profile_to_display.name || 'Unknown'}</p>
                </div>
                <div>
                    <p className="text-muted">Bio: {profile_to_display.bio || 'No bio available.'}</p>
                </div>
                <br />
                <div>
                    <a href="/update-profile" className="btn btn-primary mt-3">Edit</a>
                    <a href="/home" className="btn btn-secondary">Back</a>
                </div>
            </section>
            <br />
            <section>
                <header>
                    <h1>Posts</h1>
                </header>
                <div className="row mt-4">
                    {profile_to_display.owned_posts && profile_to_display.owned_posts.length > 0 ? (
                        <div className="list-group">
                            {profile_to_display.owned_posts.map((post) => (
                                <a href={`/blog/${post.id}`} className="list-group-item list-group-item-action" key={post.id}>
                                    <img src="https://via.placeholder.com/150" className="card-img-left" alt={post.title} />
                                    <h2>{post.title}</h2>
                                    <p>{post.content.slice(0, 100)}...</p>
                                    <small className="text-muted">Published on {new Date(post.publication_date).toLocaleDateString()}</small>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted">No posts available.</p>
                    )}
                </div>
            </section>
            <br />
            <section>
                <header>
                    <h3>Contact Us</h3>
                </header>
                <h3>Contact Links</h3>
                {profile_to_display.gmail_links && <p>Email: <a href={`mailto:${profile_to_display.gmail_links}`}>{profile_to_display.gmail_links}</a></p>}
                {profile_to_display.facebook_links && <p>Facebook: <a href={profile_to_display.facebook_links} target="_blank" rel="noopener noreferrer">{profile_to_display.facebook_links}</a></p>}
                {profile_to_display.instagram_links && <p>Instagram: <a href={profile_to_display.instagram_links} target="_blank" rel="noopener noreferrer">{profile_to_display.instagram_links}</a></p>}
                {profile_to_display.x_links && <p>X: <a href={profile_to_display.x_links} target="_blank" rel="noopener noreferrer">{profile_to_display.x_links}</a></p>}
                {profile_to_display.linkedin_links && <p>LinkedIn: <a href={profile_to_display.linkedin_links} target="_blank" rel="noopener noreferrer">{profile_to_display.linkedin_links}</a></p>}
                {profile_to_display.github_links && <p>GitHub: <a href={profile_to_display.github_links} target="_blank" rel="noopener noreferrer">{profile_to_display.github_links}</a></p>}
            </section>
        </div>
    );
};

export default UserProfile;
