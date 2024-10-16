import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/HomePage"; // Import the HomePage component
import Login from "./authentication/LoginPage";
import Register from "./authentication/Register";
import PostForm from "./pages/Add_blog";



function App() {
  return (
    <Router>
      <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/publish" element={<PostForm />} />
      </Routes>
    </Router>
  );
}

export default App;