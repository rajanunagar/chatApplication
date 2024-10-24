import React, { useState, useEffect } from "react";
import api from "../api/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useDropzone } from "react-dropzone";

function Registration() {

    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [fetchingOtp, setFetchingOtp] = useState(false);
    const [fetchingVarifyingOtp, setFetchingVarifyingOtp] = useState(false);
    const [isMailSent, setIsMailSent] = useState(false);
    const [isEmailVarified, setIsEmailVarified] = useState(false);
    const [image, setImage] = useState(null);
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPasswordd] = useState(false);
    const token = localStorage.getItem('token');
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    });
    const [seconds, setSeconds] = useState(60);
    const [selectdFileError, setSelectdFileError] = useState([]);

    const handleChange = (e) => {
        setFormData((formData) => ({
            ...formData,
            [e.target.name]: e.target.value,
        }));
    };
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPasswordd(!showConfirmPassword);
    };
    const validate = () => {
        let tempErrors = {};
        let isValid = true;
        
        if (!formData.username) {
            tempErrors["username"] = "Username is required";
            isValid = false;
        }
        else if (formData.username.length < 3) {
            tempErrors["username"] = "Username must be at least 3 characer long";
            isValid = false;
        }
        if (!formData.password) {
            tempErrors["password"] = "Password is required";
            isValid = false;
        } else if (formData.password.length < 4) {
            tempErrors["password"] = "Password must be at least 4 characters";
            isValid = false;
        }
        if (!formData.confirmPassword) {
            tempErrors["confirmPassword"] = "Confirm password is required";
            isValid = false;
        } else if (formData.confirmPassword !== formData.password) {
            tempErrors["confirmPassword"] = "Passwords do not match";
            isValid = false;
        }
        setErrors(tempErrors);
        return isValid;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            const user = JSON.parse(JSON.stringify(formData));
            delete user.confirmPassword;
            try {
                setFetching(true);
                delete user.confirmPassword;
                const usersRes = await api.auth.register(user);
                toast.success('User Register Successfully');
                navigate('/login');
                setSuccess(true);
            } catch (err) {
                setError(true);
                if (err.response.data.message) {
                    toast.error(err.response.data.message);
                }
                else {
                    console.log(err);
                }
            }
        }
        setFetching(false);
    };

    useEffect(()=>{
        if(token)
        navigate('/');
    },[token]);

    return (
        <div className="container" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        }}>
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card" style={{ backgroundColor: '#c5ecee', boxShadow: '4px 3px 5px gray' }}>
                        <div className="card-body  px-0 mx-0">
                            <h5 className="card-title text-primary" >Registration</h5>
                            <hr />
                            <div className="px-3">
                                <form onSubmit={handleSubmit} noValidate className="my-3">
                                            <div className="form-group mt-3">
                                                <input
                                                    type="text"
                                                    name="username"
                                                    className="form-control"
                                                    id="username"
                                                    placeholder="Username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                {errors.username && (
                                                    <small id="usernameHelp" className="form-text text-danger">
                                                        {errors.username}
                                                    </small>
                                                )}
                                            </div>
                                            <div className="form-group mt-3 position-relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="form-control"
                                                    name="password"
                                                    id="password"
                                                    placeholder="Password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <span
                                                    onClick={togglePasswordVisibility}
                                                    className="position-absolute end-0 top-50 translate-middle-y me-2"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                </span>
                                                {errors.password && (
                                                    <small id="passwordHelp" className="form-text text-danger">
                                                        {errors.password}
                                                    </small>
                                                )}
                                            </div>
                                            <div className="form-group mt-3 position-relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className="form-control"
                                                    name="confirmPassword"
                                                    id="confirmPassword"
                                                    placeholder="Confirm Password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <span
                                                    onClick={toggleConfirmPasswordVisibility}
                                                    className="position-absolute end-0 top-50 translate-middle-y me-2"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                                </span>
                                                {errors.confirmPassword && (
                                                    <small id="confirmPasswordHelp" className="form-text text-danger">
                                                        {errors.confirmPassword}
                                                    </small>
                                                )}
                                            </div>
                                            {!fetching && <button type="submit"  className="btn btn-primary mt-3">Submit</button>}
                                            {fetching && <div className="spinner-border" role="status"></div>}
                                        <div className="mt-3">
                                            If you have already an account click
                                            <Link to="/login" className="mx-1">here</Link>
                                        </div>
                                </form>
                            </div>

                        </div>
                    </div >
                </div >
            </div >
        </div >
    );
}

export default Registration;