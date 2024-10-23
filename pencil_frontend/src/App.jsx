import React, {useState} from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage"; // Import the HomePage component
import Login from "./authentication/LoginPage";
import Register from "./authentication/Register";
import Logout from "./authentication/Logout";
import PostForm from "./pages/Add_blog";
import BlogPost from "./pages/Blog";
import ModifyPost from "./pages/Modify_blog";
import EditProfile from "./pages/Edit_profile";
import UserProfile from "./pages/Profile";




function App() {
  const [token, setToken] = useState('');

  return (
    <Router>
      <Routes>
      <Route path="/home" element={<HomePage token={token} />} />
      <Route path="/login" element={<Login setToken={setToken} />} />
      <Route path="/register" element={<Register token={token} />} />
      <Route path="/logout" element={<Logout token={token} />} />
      <Route path="/publish" element={<PostForm token={token} />} />
      <Route path="/blog/:postId" element={<BlogPost token={token} />} />
      <Route path="/modify/:postId" element={<ModifyPost token={token} />} />
      <Route path="/update-profile/:profileId" element={<EditProfile token={token} />} />
      <Route path="/profile/:profileId" element={<UserProfile token={token} />} />
        {/* Define other routes here */}
      </Routes>
    </Router>
  );
}

export default App;