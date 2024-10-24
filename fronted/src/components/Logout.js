import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router';
import { clearLocalStorage } from '../functions/function';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { clearUser } from '../features/user/userSlice';
import api from '../api/api';
import { useNavigate } from 'react-router';

function Logout({ socket }) {

    const dispatch = useDispatch();
    const [loading,setLoading]=useState(false);
    const [isLoggedOut,setIsLoggedOut]=useState(true);
    const navigate = useNavigate();

    const logoutUser = async () => {
        try {
            setLoading(true);
            const res = await api.auth.logout();
            socket.disconnect();
            clearLocalStorage();
            dispatch(clearUser());
            toast.success('user loged out successfully');
            setIsLoggedOut(true);
            navigate('/login');
        }
        catch (err) {
            if (err.response.data.message) {
                toast.error(err.response.data.message);
            }
            else {
                console.log(err);
            }
        }
        setLoading(false);
    }

    useEffect(() => {
        logoutUser();
    }, []);

    return (<>
       {!loading && isLoggedOut &&  <Navigate to='/login'></Navigate>}
       {loading && <div className="spinner-border" role="status">
                                            <span className="sr-only">  </span>
                                        </div>}
        </>
    )
}

export default Logout