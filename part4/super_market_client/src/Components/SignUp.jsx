import React, { useState } from 'react';
import { useUser } from './ClientPage';
import { useNavigate } from 'react-router-dom';
import Validation from '../ValidationChecking';
const SignUp = () => {
    const [hasAddedProduct, setHasAddedProduct] = useState(false);
    const currentUser = useUser();
    const [admin, setAdmin] = useState(true);
    const navigate = useNavigate();
    const [formDataManager, setFormDataManager] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });
    const [productDetails, setproductDetails] = useState([{
        name: '',
        price: '',
        quantity: ''
    }]);

    const [formDataSupp, setFormDataSupp] = useState({
        companyName: '',
        phone: '',
        representativeName: '',
        products: []
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
                    <><input type="text"
                        name="name"
                        value={formDataManager.name}
                        onChange={handleChange}
                        placeholder='name'
                        required />
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
                        <input type="phone"
                            name="phone"
                            value={formDataManager.phone}
                            onChange={handleChange}
                            placeholder='phone'
                            required />
                    </>
                ) : (
                    <>
                        <input type="text"
                            name="companyName"
                            value={formDataSupp.companyName}
                            onChange={handleChange}
                            placeholder='name of company'
                            required />
                        <input type="phone"
                            name="phone"
                            value={formDataSupp.phone}
                            onChange={handleChange}
                            placeholder='phone'
                            required />
                        <input type="text"
                            name="representativeName"
                            value={formDataSupp.representativeName}
                            onChange={handleChange}
                            placeholder='name of a representative'
                            required />
                        <div>add a product to list:</div>
                        <input type="text"
                            name="productName"
                            value={productDetails.productName}
                            onChange={handleChangeProduct}
                            placeholder='name of product'
                            required={!hasAddedProduct}
                        />
                        <input type="number"
                            name="price"
                            value={productDetails.price}
                            onChange={handleChangeProduct}
                            placeholder='price'
                            required={!hasAddedProduct}
                        />
                        <input type="number"
                            name="quantity"
                            value={productDetails.quantity}
                            onChange={handleChangeProduct}
                            placeholder='Minimum quantity'
                            required={!hasAddedProduct}
                        />
                        <button type='button' onClick={addProduct}>add</button>

                    </>
                )}
            </>
        )
    }

    const addProduct = () => {
        if (productDetails.productName && productDetails.price && productDetails.quantity) {
            setFormDataSupp(prev => ({
                ...prev,
                products: [...prev.products, {
                    name: productDetails.productName,
                    price: productDetails.price,
                    quantity: productDetails.quantity
                }]
            }));
            setproductDetails({
                productName: '',
                price: '',
                quantity: ''
            });
            setHasAddedProduct(true);
        } else {
            setError('Please fill all product details before adding');
        }
    };
    const handleChangeProduct = (e) => {
        const { name, value } = e.target;
        setproductDetails(prev => ({
            ...prev,
            [name]: value
        }));
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!admin && !hasAddedProduct) {
            setError('Please add at least one product');
            return;
        }
        if (admin) {
            if (!Validation.validateEmail(formDataManager.email) || !Validation.validatePassword(formDataManager.password)
                || !Validation.validateName(formDataManager.name) || !Validation.validatePhone(formDataManager.phone)) {
                setError('Please enter a valid details');
                return;
            }
        }
        else {
            if (!Validation.validateName(formDataSupp.companyName) || !Validation.validateName(formDataSupp.representativeName)
                || !Validation.validatePhone(formDataSupp.phone)) {
                setError('Please enter a valid details');
                return;
            }
        }
        try {
            const response = await fetch(admin ? 'http://localhost:5000/api/manager/register' :
                'http://localhost:5000/api/suppliers/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(admin ? formDataManager : formDataSupp),
            });

            const data = await response.json();

            if (response.ok) {
                admin ? setFormDataManager({
                    name: '',
                    email: '',
                    password: '',
                    phone: ''
                }) : setFormDataSupp({
                    companyName: '',
                    phone: '',
                    representativeName: '',
                    products: []
                });
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
                <button type="submit">Sign up</button>
                {admin ? <button onClick={() => setAdmin(!admin)}><div>Want to log in as a supplier?</div>
                </button> : <button onClick={() => setAdmin(!admin)}><div>Want to log in as an administrator?</div>
                </button>}
                {error && <p className="error">{error}</p>}

            </form>
        </>

    )
}
export default SignUp
