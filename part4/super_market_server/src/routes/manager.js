const express = require('express');
const router = express.Router();
const Manager = require('../models/Manager');
const Validation = require('../Validation');
router.post('/login', async (req, res) => {
    try {
        
        if (!Validation.validateEmail(req.body.email) || !Validation.validatePassword(req.body.password)) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const { email } = req.body;
        const manager = await Manager.findOne({
            email: email,
        });
        if (manager) {
            res.status(200).json({
                message: 'Login successful',
                manager: {
                    id: manager._id,
                    name: manager.name,
                    email: manager.email,
                    phone: manager.phone
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        if (!Validation.validateEmail(req.body.email) || !Validation.validatePassword(req.body.password) ||
            !Validation.validateName(req.body.name) || !Validation.validatePhone(req.body.phone)) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const { name, email, password, phone } = req.body;

        const existingManager = await Manager.find();
        if (existingManager.length) {
            return res.status(400).json({ message: 'There can only be one manager.' });
        }

        const manager = new Manager({
            name,
            email,
            password,
            phone
        });

        await manager.save();
        res.status(201).json({
            message: 'Manager registered successfully',
            manager: {
                id: manager._id,
                name: manager.name,
                email: manager.email,
                phone: manager.phone
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});






module.exports = router;