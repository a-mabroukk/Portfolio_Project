import React, { useEffect, useState } from "react";
import axios from "axios";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  // Fetch data from Flask backend on component mount
  useEffect(() => {
    const fetchData = async () => {
        console.log("Fetching posts...");
        setLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:5000/home");
            console.log("Response data:", response.data);
            setPosts(response.data || []);
        } catch (err) {
            console.error(err);  // Log the error for debugging
            setError("An error occurred while fetching posts.");
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, []);

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/home", {
        input_search: searchInput,
      }, {
        headers: { "Content-Type": "application/json" }
      });

      setSearchResults(response.data || []);
    } catch (err) {
      console.error(err);
      setError("No results found");
    } finally {
      setLoading(false);
    }
  };

  // Error handling
  if (error) {
    return <div>Error: {error}</div>;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mt-5">
      <h1 className="text-center">Welcome to Pencil</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search posts..."
          className="form-control"
        />
        <button type="submit" className="btn btn-primary mt-2">Search</button>
      </form>

      <h2 className="text">Search Results:</h2>
      <div className="row mt-4">
        {searchResults.length > 0 ? (
          searchResults.map((post) => (
            <div key={post.id} className="col-md-4">
              <div className="card">
                <img src="https://via.placeholder.com/150" className="card-img-top" alt={post.title} />
                <div className="card-body">
                  <a href={`/blog/${post.id}`}>{post.title}</a>
                </div>
                <div className="card-body">
                  <a href={`/blog/${post.id}`} className="btn btn-primary">View</a>
                </div>
              </div>
            </div>
          ))
        ) : (
          posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="col-md-4">
                <div className="card">
                  <img src="https://via.placeholder.com/150" className="card-img-top" alt={post.title} />
                  <div className="card-body">
                    <a href={`/blog/${post.id}`}>{post.title}</a>
                  </div>
                  <div className="card-body">
                    <a href={`/blog/${post.id}`} className="btn btn-primary">View</a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No posts available</p>
          )
        )}
      </div>
    </div>
  );
};

export default HomePage;
