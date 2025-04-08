import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const errorMessage = location.state?.error;

    const goBack = () => {
            navigate('/login');  
    };

    return (
        <>
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h1>404 - Page Not Found</h1>
                {errorMessage && (
                    <p style={{ color: 'red', marginBottom: '20px' }}>
                        Error: {errorMessage}
                    </p>
                )}
                <button onClick={goBack}>Go Back</button> 
            </div>
        </>
    );
};

export default NotFound;
