import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const profileId = new URLSearchParams(window.location.search).get('profile_id'); // Get profile_id from URL

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/profile?profile_id=${profileId}`); // Adjust API endpoint
                if (response.data.category === 'success') {
                    setProfile(response.data);
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

        fetchProfile();
    }, [profileId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-danger">{error}</div>;
    if (!profile) return <div>No profile found.</div>;

    return (
        <div className="container mt-5">
            <section>
                <div>
                    {profile.profile_picture ? (
                        <img src={`/static/uploads/${profile.profile_picture}`} alt="Profile" />
                    ) : (
                        <p>No profile picture uploaded</p>
                    )}
                </div>
                <div>
                    <p className="text-muted">Author: {profile.name || 'Unknown'}</p>
                </div>
                <div>
                    <p className="text-muted">Bio: {profile.bio || 'No bio available.'}</p>
                </div>
                <br />
                <div>
                    <a href="/edit-profile" className="btn btn-primary mt-3">Edit</a>
                    <a href="/home" className="btn btn-secondary">Back</a>
                </div>
            </section>
            <br />
            <section>
                <header>
                    <h1>Posts</h1>
                </header>
                <div className="row mt-4">
                    {profile.owned_posts && profile.owned_posts.length > 0 ? (
                        <div className="list-group">
                            {profile.owned_posts.map((post) => (
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
                {profile.gmail_links && <p>Email: <a href={`mailto:${profile.gmail_links}`}>{profile.gmail_links}</a></p>}
                {profile.facebook_links && <p>Facebook: <a href={profile.facebook_links} target="_blank" rel="noopener noreferrer">{profile.facebook_links}</a></p>}
                {profile.instagram_links && <p>Instagram: <a href={profile.instagram_links} target="_blank" rel="noopener noreferrer">{profile.instagram_links}</a></p>}
                {profile.x_links && <p>X: <a href={profile.x_links} target="_blank" rel="noopener noreferrer">{profile.x_links}</a></p>}
                {profile.linkedin_links && <p>LinkedIn: <a href={profile.linkedin_links} target="_blank" rel="noopener noreferrer">{profile.linkedin_links}</a></p>}
                {profile.github_links && <p>GitHub: <a href={profile.github_links} target="_blank" rel="noopener noreferrer">{profile.github_links}</a></p>}
            </section>
        </div>
    );
};

export default UserProfile;
