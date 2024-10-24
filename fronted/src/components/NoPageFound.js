import React from 'react';
import { useNavigate } from 'react-router-dom';

function NoPageFound() {
    const navigate = useNavigate();


    return (
        <div className="container h-100 mt-5 mb-5">
            <div className="row d-flex justify-content-center align-items-center">
                <div className='col-12 col-md-8'>
                    <div className="card border-0">
                        <div className="card-body text-center">
                            <h5 className="card-title">404 - Page Not Found</h5>
                            <p className="card-text">
                                Sorry, the page you are looking for does not exist. Please check the URL or return to the homepage.
                            </p>
                            <button onClick={() => navigate('/')} className='btn btn-primary card-link'>Go to Homepage</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NoPageFound;
