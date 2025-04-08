// Supplier Schema
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});

const supplierSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    representativeName: {
        type: String,
        required: true
    },
    products: [productSchema]
});

module.exports = mongoose.model('Supplier', supplierSchema);