
import { useUser } from "./ClientPage";
import React, { useState, useEffect } from 'react';
import '../Css/SupplierDashboard.css';
import { useNavigate } from "react-router";

const SupplierDashboard = () => {
    const currentUser = useUser();
    currentUser.current = currentUser.current ? currentUser.current : JSON.parse(localStorage.getItem('currentUser'));
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        currentUser.current = currentUser.current ? currentUser.current : JSON.parse(localStorage.getItem('currentUser'));
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/supplier/${encodeURIComponent(currentUser.current.name)}`);
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleStatusChange = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/approval`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const updatedOrder = await response.json();
            
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order._id === orderId ? updatedOrder : order
                )
            );
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status. Please try again.');
        }
    };

    const logOut=()=>{
        localStorage.removeItem('currentUser');
        navigate('/login', { replace: true });
        window.history.pushState({}, '');    
    }

    return (
        <div className="dashboard-container">
            <button onClick={logOut}>Log out</button>
            <h1>Welcome, {currentUser.current.name}</h1>
            
            <div className="orders-container">
                <h2>Orders</h2>
                {orders.length === 0 ? (
                    <p>No orders found</p>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order._id} className="order-card">
                                <h3>Order ID: {order._id}</h3>
                                <div className="order-details">
                                    <div>Products:</div>
                                    <ul>
                                        {order.products.map((product, index) => (
                                            <li key={index}>
                                                {product.name} x {product.orderedQuantity}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="order-status">
                                    Status: <span className={`status-${order.status}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="order-total">
                                    Total: ${order.totalPrice}
                                </div>
                                {order.status === 'pending' && (
                                    <button 
                                        onClick={() => handleStatusChange(order._id)}
                                        className="confirm-button"
                                    >
                                        Confirm Delivery
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupplierDashboard;