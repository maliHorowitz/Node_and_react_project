

import React, { useState, useEffect } from 'react';
import { useUser } from './ClientPage';
import { useNavigate } from "react-router";
import '../Css/ManagerDashboard.css';


const ManagerDashboard = () => {
    const currentUser = useUser();
    currentUser.current = currentUser.current ? currentUser.current : JSON.parse(localStorage.getItem('currentUser'));
    const navigate = useNavigate();

    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [orderItems, setOrderItems] = useState({});
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchSuppliers();
        fetchOrders();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/suppliers', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setSuppliers(data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const isConvertToInt = (val) => {
        const num = Number(val);
        return Number.isInteger(num);
    }
    const handleOrderChange = (productId, stringQuantity) => {
        let quantity;
        if (isConvertToInt(stringQuantity))
            quantity = parseInt(stringQuantity);
        else {
            alert('quantity must be a number');
        }
        const product = selectedSupplier.products.find(p => p._id.toString() === productId);
        const minQuantity = product.quantity;

        if (quantity < minQuantity) {
            alert(`Minimum order quantity for ${product.name} is ${minQuantity}`);
            return;
        }

        setOrderItems(prev => ({
            ...prev,
            [productId]: quantity
        }));
    };

    const calculateTotal = (orderItems) => {
        let total = 0;
        for (const [productId, quantity] of Object.entries(orderItems)) {
            const product = selectedSupplier.products.find(p => p._id.toString() === productId);
            if (product) {
                total += product.price * quantity;
            }
        }
        return total;
    };

    const placeOrder = async (supplierId, orderItems) => {
        try {
            const total = calculateTotal(orderItems);
            let productsArray = [];
            for (const [productId, orderedQuantity] of Object.entries(orderItems)) {
                const product = selectedSupplier.products.find(p => p._id.toString() === productId);

                if (!product) {
                    alert(`Product with ID ${productId} not found`);
                    return;
                }
                if (orderedQuantity < product.quantity) {
                    alert(`Minimum order quantity for ${product.name} is ${product.quantity}`);
                    return;
                }
                product.orderedQuantity = orderedQuantity;
                const { quantity, ...updatedProduct } = product;
                productsArray.push(updatedProduct);
            }
            const response = await fetch(`http://localhost:5000/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    supplierId: supplierId,
                    products: productsArray,
                    totalPrice: total,
                })
            });
            const data = await response.json();
            if (response.ok && data != null) {
                alert('Order placed successfully!');
                setOrderItems({});
                setSelectedSupplier(null);
                fetchOrders();
            }
        } catch (error) {
            console.error('Error placing order:', error);
        }
    };

    const confirmDelivery = async (order) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${order._id}/confirm-delivery`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            });
            const data = await response.json();
            if (response.ok && data != null) {
                fetchOrders();
            }
        } catch (error) {
            console.error('Error confirming delivery:', error);
        }
    };


    const logOut = () => {
        localStorage.removeItem('currentUser');
        navigate('/login', { replace: true });
        window.history.pushState({}, '');
    }

    return (
        <div className="dashboard-container">
            <button onClick={logOut}>Log out</button>

            <h1>Welcome, {currentUser.current.name}</h1>

            <div className="orders-section">
                <h2>Your Orders</h2>
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order._id} className="order-item">
                            <h3>Order #{order._id}</h3>
                            <p>Status: {order.status}</p>
                            <div className="order-products">
                                {order.products.map(product => (
                                    <div key={product.productId}>
                                        <p>{product.name} x {product.orderedQuantity}</p>
                                        <p>Price: ${product.price}</p>
                                    </div>
                                ))}
                            </div>
                            <p>Total: ${order.totalPrice}</p>
                            {order.status === 'in_progress' && (
                                <button className="confirm-button"
                                    onClick={() => confirmDelivery(order)}>
                                    Confirm Delivery
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="suppliers-list">
                <h2>Suppliers</h2>
                <div className="supplier-cards">
                    {suppliers.map(supplier => (
                        <div
                            key={supplier._id}
                            className="supplier-card"
                            onClick={() => setSelectedSupplier(supplier)}
                        >
                            <h3>{supplier.companyName}</h3>
                            <p>Representative: {supplier.representativeName}</p>
                            <p>Phone: {supplier.phone}</p>
                        </div>
                    ))}
                </div>
            </div>

            {selectedSupplier && (
                <div className="supplier-details">
                    <h2>{selectedSupplier.companyName} - Products</h2>
                    <div className="products-list">
                        {selectedSupplier.products.map(product => (
                            <div key={product._id} className="product-item">
                                <h3>{product.name}</h3>
                                <p>Price: ${product.price}</p>
                                <p>Minimum Order: {product.quantity}</p>
                                <input
                                    type="number"
                                    min={product.quantity}
                                    value={orderItems[product._id] || 0}
                                    onChange={(e) => handleOrderChange(product._id, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="order-summary">
                        <p>Total Amount: ${calculateTotal(orderItems).toFixed(2)}</p>
                        <button
                            onClick={() => placeOrder(selectedSupplier._id, orderItems)}
                            disabled={Object.values(orderItems).every(q => q === 0)}
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;