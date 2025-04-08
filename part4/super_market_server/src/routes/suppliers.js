

const express = require('express');
const router = express.Router();
const Supplier = require('../models/Suppliers');
const Validation = require('../Validation');



router.get('/', async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        if(!Validation.validatePhone(req.body.phone)|| !Validation.validateName(req.body.companyName)){
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const { companyName, phone } = req.body;
        const supplier = await Supplier.findOne({ companyName: companyName, phone: phone });
        if (supplier) {
            res.status(200).json({
                message: 'Login successful',
                supplier: {
                    id: supplier._id,
                    companyName: supplier.companyName,
                    phone: supplier.phone,
                    representativeName: supplier.representativeName
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        if(!Validation.validatePhone(req.body.phone)|| !Validation.validateName(req.body.companyName)
        ||!Validation.validateName(req.body.representativeName)){
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const { companyName, phone, representativeName, products } = req.body;
        const existingSupplier = await Supplier.findOne({ companyName });
        if (existingSupplier) {
            return res.status(400).json({ message: 'Company already exists' });
        }

        const supplier = new Supplier({
            companyName,
            phone,
            representativeName,
            products
        });

        await supplier.save();
        res.status(201).json({ message: 'Supplier added successfully', supplier });
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding supplier', error: error.message });
    }
});

module.exports = router;