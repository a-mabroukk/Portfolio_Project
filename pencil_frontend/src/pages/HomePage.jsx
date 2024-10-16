import React, { useEffect, useState } from "react";
import axios from "axios";

const HomePage = () => {
  const [posts, setPosts] = useState([]);  // Initialize posts as an empty array
  const [searchResults, setSearchResults] = useState([]); // Initialize searchResults as an empty array
  const [loading, setLoading] = useState(true);  // For loading state
  const [error, setError] = useState(null);  // For error handling
  const [searchInput, setSearchInput] = useState(""); // For search input

  const Home = () => {

  // Fetch data from Flask backend on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/home");  // Fetch posts
        setPosts(response.data.posts || []);  // Ensure posts is set as an empty array if undefined
        setLoading(false);  // Disable loading after fetching data
      } catch (err) {
        setError("An error occurred while fetching posts.");
        setLoading(false);  // Disable loading on error
      }
    };

    fetchData();
  }, []);
  }

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();  // Prevent the default form submission
    setLoading(true);  // Show loading while fetching data

    try {
      const response = await axios.post("/home", { input_search: searchInput });  // Post search query
      setSearchResults(response.data.searchResults || []);  // Ensure searchResults is set as an empty array if undefined
      setLoading(false);  // Disable loading
    } catch (err) {
      setError("No results found");  // Handle error if no results
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;  // Show loading while data is fetched

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
        {searchResults && searchResults.length > 0 ? ( // Check if searchResults exists and has length
          searchResults.map((post) => (
            <div key={post.id} className="col-md-4">
              <div className="card">
                <img src="https://via.placeholder.com/150" className="card-img-top" alt={post.title} />
                <div className="card-body">
                  <a href={`/blog/${post.id}`}>{post.title}</a>  {/* Link to individual blog */}
                </div>
                <div className="card-body">
                  <a href={`/blog/${post.id}`} className="btn btn-primary">View</a>
                </div>
              </div>
            </div>
          ))
        ) : (
          posts && posts.length > 0 ? ( // Check if posts exists and has length
            posts.map((post) => (
              <div key={post.id} className="col-md-4">
                <div className="card">
                  <img src="https://via.placeholder.com/150" className="card-img-top" alt={post.title} />
                  <div className="card-body">
                    <a href={`/blog/${post.id}`}>{post.title}</a>  {/* Link to individual blog */}
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
