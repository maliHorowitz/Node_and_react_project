const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Supplier = require('../models/Suppliers');

const { ObjectId } = require('mongoose').Types; 

router.get('/', async (req, res) => {
    try {
        const order = await Order.find();
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }

});


router.put('/:id/confirm-delivery', async (req, res) => {
    try {
        const orderId = req.params.id;
        if (!ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }
        const updatedOrder = await Order.findOneAndUpdate(
            { 
                _id: orderId,  
                status: 'in_progress'  
            },
            { status: 'confirmed' },  
            { new: true, runValidators: true }
        );
        if (!updatedOrder) {
            return res.status(400).json({
                message: 'Order cannot be confirmed. Either not found or status is not "in_progress"'
            });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });

    }
});

router.put('/:id/approval', async (req, res) => {
    try {
        const orderId = req.params.id;
        if (!ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }
        const updatedOrder = await Order.findOneAndUpdate(
            { 
                _id: orderId,  
                status: 'pending'  
            },
            { status: 'in_progress' },  
            { new: true, runValidators: true }
        );
        if (!updatedOrder) {
            return res.status(400).json({
                message: 'Order cannot be confirmed. Either not found or status is not "pending"'
            });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });

    }
});

router.post('/', async (req, res) => {
    try {
        const { supplierId, products, totalPrice } = req.body;

        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        const order = new Order({
            supplierId,
            products: products.map(product => ({
                name: product.name,
                productId: product._id,
                orderedQuantity: product.orderedQuantity,
                price: product.price
            })),
            status: 'pending',
            totalPrice
        });

        await order.save();
        res.status(201).json(order);

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({ message: error.message });
    }
});


router.get('/supplier/:name', async (req, res) => {
    try {
        // Decode the name from the URL
        const name = decodeURIComponent(req.params.name);
        
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ message: 'Invalid supplier name' });
        }
        
        const supplier = await Supplier.findOne({ representativeName: name });
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        
        const orders = await Order.find({ supplierId: supplier._id });
        if(!orders)
        console.log("not order");
        res.json(orders);
    } catch (error) {
        console.error('Error in supplier route:', error);
        res.status(500).json({ message: error.message });
    }
});




module.exports = router;