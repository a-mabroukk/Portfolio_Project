import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
//import './Register.css'; // You can create a CSS file for additional styles if needed

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email_address: '',
        password1: '',
        password2: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear previous errors

        try {
            const response = await axios.post('http://127.0.0.1:5000/register', formData);
            console.log(response.data); // Handle success response
            navigate('/home'); // Redirect to home page or another page after successful registration
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                setErrorMessage(error.response.data.error); // Set error message from server response
            } else {
                setErrorMessage('An error occurred. Please try again.'); // General error
            }
        }
    };

    return (
        <div className="text-center">
            <div className="container">
                <form onSubmit={handleSubmit} className="form-register" style={{ color: 'white' }}>
                    <img className="mb-4" src="https://res.cloudinary.com/jimshapedcoding/image/upload/v1597332609/android-icon-192x192_ove2a7.png" alt=""/>
                    <h1 className="h3 mb-3 font-weight-normal">Please Create your Account</h1>
                    <br />
                    <label>User Name</label>
                    <input type="text" name="username" className="form-control" placeholder="User Name" value={formData.username}
                        onChange={handleChange}required/>
                    <label>Email Address</label>
                    <input type="email" name="email_address" className="form-control" placeholder="Email Address" value={formData.email_address}
                        onChange={handleChange} required/>
                    <label>Password</label>
                    <input type="password" name="password1" className="form-control" placeholder="Password" value={formData.password1}
                        onChange={handleChange} required/>
                    <label>Confirm Password</label>
                    <input type="password" name="password2" className="form-control" placeholder="Confirm Password" value={formData.password2}
                        onChange={handleChange} required/>
                    {errorMessage && <div className="alert alert-danger mt-2">{errorMessage}</div>}
                    <br />
                    <div className="checkbox mb-3">
                        <h2>Already have an account?</h2>
                        <a className="btn btn-sm btn-secondary" href="/login">Login</a>
                    </div>
                    <button type="submit" className="btn btn-lg btn-block btn-primary">Create an Account</button>
                </form>
                <br />
            </div>
            <div>
            {/* Footer */}
            <footer className="footer">
                <svg className="footer-border" height="214" viewBox="0 0 2204 214" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2203 213C2136.58 157.994 1942.77 -33.1996 1633.1 53.0486C1414.13 114.038 1200.92 188.208 967.765 118.127C820.12 73.7483 263.977 -143.754 0.999958 158.899" strokeWidth="2" />
                </svg>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-5 text-center text-md-left mb-4">
                            <ul className="list-inline footer-list mb-0">
                                <li className="list-inline-item"><a href="privacy-policy.html">Privacy Policy</a></li>
                                <li className="list-inline-item"><a href="terms-conditions.html">Terms Conditions</a></li>
                            </ul>
                        </div>
                        <div className="col-md-2 text-center mb-4">
                            <a href="/"><img className="img-fluid" width="100px" src="static/images/logo.png" alt="Reader | Hugo Personal Blog Template" /></a>
                        </div>
                        <div className="col-md-5 text-md-right text-center mb-4">
                            <ul className="list-inline footer-list mb-0">
                                <li className="list-inline-item"><a href="#"><i className="ti-facebook"></i></a></li>
                                <li className="list-inline-item"><a href="#"><i className="ti-twitter-alt"></i></a></li>
                                <li className="list-inline-item"><a href="#"><i className="ti-linkedin"></i></a></li>
                                <li className="list-inline-item"><a href="#"><i className="ti-github"></i></a></li>
                                <li className="list-inline-item"><a href="#"><i className="ti-youtube"></i></a></li>
                            </ul>
                        </div>
                        <div className="col-12">
                            <div className="border-bottom border-default"></div>
                        </div>
                    </div>
                </div>
            </footer>
            </div>
            {/* JS Plugins - Optional, use if you need them */}
            {/* You can add these script tags in the public/index.html file instead */}
            {/* <script src="{{ url_for('static', filename='plugins/jQuery/jquery.min.js') }}"></script> */}
            {/* <script src="{{ url_for('static', filename='plugins/bootstrap/bootstrap.min.js') }}"></script> */}
            {/* <script src="{{ url_for('static', filename='plugins/slick/slick.min.js') }}"></script> */}
            {/* <script src="{{ url_for('static', filename='plugins/instafeed/instafeed.min.js') }}"></script> */}
            {/* <script src="{{ url_for('static', filename='js/script.js') }}"></script> */}
        </div>
    );
};

export default Register;
