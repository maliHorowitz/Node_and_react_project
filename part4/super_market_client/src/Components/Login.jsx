


import React, { useState } from 'react';
import { useUser } from './ClientPage';
import { useNavigate } from 'react-router-dom';
import Validation from '../ValidationChecking';

const Login = () => {
    const currentUser = useUser();
    const [admin, setAdmin] = useState(true);
    const navigate = useNavigate();
    const [formDataManager, setFormDataManager] = useState({
        email: '',
        password: ''
    });
    const [formDataSupp, setFormDataSupp] = useState({
        companyName: '',
        phone: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        admin ? setFormDataManager(prev => ({
            ...prev,
            [name]: value
        })) : setFormDataSupp(prev => ({
            ...prev,
            [name]: value
        }))
    };
    const createInputs = () => {
        return (
            <>
                {admin ? (
                    <>
                        <input type="email"
                            name="email"
                            value={formDataManager.email}
                            onChange={handleChange}
                            placeholder='email'
                            required />
                        <input type="password"
                            name="password"
                            value={formDataManager.password}
                            onChange={handleChange}
                            placeholder='password'
                            required />
                    </>
                ) : (
                    <>
                        <input type="text"
                            name="companyName"
                            value={formDataSupp.name}
                            onChange={handleChange}
                            placeholder="company name"

                            required />
                        <input type="phone"
                            name="phone"
                            value={formDataSupp.phone}
                            onChange={handleChange}
                            placeholder='phone'
                            required />
                    </>
                )}
            </>
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (admin) {
            if (!Validation.validateEmail(formDataManager.email) || !Validation.validatePassword(formDataManager.password)) {
                setError('Please enter a valid details');
                return;
            }
        }
        else {
            if (!Validation.validateName(formDataSupp.companyName) || !Validation.validatePhone(formDataSupp.phone)) {
                setError('Please enter a valid details');
                return;
            }
        }

        try {
            const response = await fetch(admin ? 'http://localhost:5000/api/manager/login' :
                'http://localhost:5000/api/suppliers/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(admin ? formDataManager : formDataSupp),
            });

            const data = await response.json();

            if (response.ok) {
                admin ?
                    setFormDataManager({
                        email: '',
                        password: '',
                    }) : setFormDataSupp({
                        name: '',
                        phone: '',
                    })
                currentUser.current = { name: admin ? data.manager.name : data.supplier.representativeName };
                localStorage.setItem('currentUser', JSON.stringify(currentUser.current));
                setError('');
                if (admin) {
                    navigate('/manager/dashboard');
                } else {
                    navigate('/supplier/dashboard');
                }
            } else {
                setError(data.message);
            }
        } catch (error) {
            console.log(error.message);
            setError('An error occurred during registration');
        }
    };


    return (
        <>
            <form onSubmit={handleSubmit}>
                {createInputs()}
                <button type="submit">Login</button>
                {admin ? <button onClick={() => setAdmin(!admin)}><div>Want to log in as a supplier?</div>
                </button> : <button onClick={() => setAdmin(admin)}><div>Want to log in as an administrator?</div>
                </button>}
                {error && <p className="error">{error}</p>}

            </form>
        </>

    )
}
export default Login
