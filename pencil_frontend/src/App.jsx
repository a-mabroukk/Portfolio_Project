import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage"; // Import the HomePage component
import Login from "./authentication/LoginPage";
import Register from "./authentication/Register";
import PostForm from "./pages/Add_blog";
import BlogPost from "./pages/Blog";




function App() {
  return (
    <Router>
      <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/publish" element={<PostForm />} />
      <Route path="/blog/:postId" element={<BlogPost />} />
        {/* Define other routes here */}
      </Routes>
    </Router>
  );
}

export default App;