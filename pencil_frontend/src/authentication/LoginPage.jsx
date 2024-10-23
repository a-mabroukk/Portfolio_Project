import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate(); // Hook for navigation

  const Login = async (e) => {
    e.preventDefault();
    await axios
      .post(
        "http://127.0.0.1:5000/login",
        {
          username: username,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        console.log(response);
        //console.log(response.data);
        const token = response.data.access_token;
        console.log("ffffffffffffffffffffffffffffff");
        console.log("ffffffffffffffffffffffffffffff",token);
        setToken(token);
        localStorage.setItem("authToken", token);
        navigate("/home");
      })
      .catch(function (error) {
        console.log(error, "error");
        if (error.response && error.response.status === 401) {
          alert("Invalid credentials");
        }
      });
  };

  return (
    <div className="text-center">
      <div className="container">
        <form>
          <img
            className="mb-4"
            src="https://res.cloudinary.com/jimshapedcoding/image/upload/v1597332609/android-icon-192x192_ove2a7.png"
            alt=""
          />
          <h1 className="h3 mb-3 font-weight-normal">Please Login</h1>
          <br />

          {/* Username Input */}
          <label className="sr-only">Username</label>
          <input
            type="text"
            className="form-control"
            placeholder="User Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <br />

          {/* Password Input */}
          <label className="sr-only">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />
          <div className="form-check mb-0">
            <input
              className="form-check-input me-2"
              type="checkbox"
              value=""
              id="form2Example3"
            />
            <label className="form-check-label" htmlFor="form2Example3">
              Remember me
            </label>
          </div>
          <div className="text-center text-lg-start mt-4 pt-2">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={Login}
            >
              Log In
            </button>
            <p className="small fw-bold mt-2 pt-1 mb-0">
              Don't have an account?{" "}
              <a href="/register" className="link-danger">
                Register
              </a>
            </p>
          </div>
        </form>
        {message && <div className="alert mt-3">{message}</div>}
        <br />
      </div>
      <footer className="footer">
        <svg
          className="footer-border"
          height="214"
          viewBox="0 0 2204 214"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2203 213C2136.58 157.994 1942.77 -33.1996 1633.1 53.0486C1414.13 114.038 1200.92 188.208 967.765 118.127C820.12 73.7483 263.977 -143.754 0.999958 158.899"
            strokeWidth="2"
          />
        </svg>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-5 text-center text-md-left mb-4">
              <ul className="list-inline footer-list mb-0">
                <li className="list-inline-item">
                  <a href="privacy-policy.html">Privacy Policy</a>
                </li>
                <li className="list-inline-item">
                  <a href="terms-conditions.html">Terms Conditions</a>
                </li>
              </ul>
            </div>
            <div className="col-md-2 text-center mb-4">
              <a href="index.html">
                <img
                  className="img-fluid"
                  width="100px"
                  src="static/images/logo.png"
                  alt="Reader | Hugo Personal Blog Template"
                />
              </a>
            </div>
            <div className="col-md-5 text-md-right text-center mb-4">
              <ul className="list-inline footer-list mb-0">
                <li className="list-inline-item">
                  <a href="#">
                    <i className="ti-facebook"></i>
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="#">
                    <i className="ti-twitter-alt"></i>
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="#">
                    <i className="ti-linkedin"></i>
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="#">
                    <i className="ti-github"></i>
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="#">
                    <i className="ti-youtube"></i>
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-12">
              <div className="border-bottom border-default"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
