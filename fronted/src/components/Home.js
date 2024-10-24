import React from 'react'
import home from '../assets/images/5127314.jpg';
import { useNavigate } from 'react-router';

function Home() {

    const navigate = useNavigate();

    return (
        
        <div className="container h-100 mt-5 mb-5">
            <div className="row d-flex justify-content-center align-items-center">
                <div className='col-12 col-md-6' >
                    <div className="card border-0">
                        <div className="card-body">
                            <h5 className="card-title">Chat Applcation</h5>
                            <p className="card-text">
                                ChatApp is the system to connect users
                            </p>
                           
                                <button onClick={() => navigate('/conversation')} className='btn btn-primary card-link'>Do chat</button>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <img className="card-img-bottom img-fluid" src={home} alt="Card image cap" style={{ maxHeight: "650px" }} />

                </div>
            </div>
        </div>
    )
}

export default Home