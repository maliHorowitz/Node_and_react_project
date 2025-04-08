// Order Schema
const mongoose = require('mongoose');
const Supplier = require('./Suppliers'); 

const orderSchema = new mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    products: [{
        name: {
            type: String,
            required: true
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        orderedQuantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'confirmed'],
        default: 'pending'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});



orderSchema.pre('save', async function(next) {
    try {
        const supplier = await Supplier.findById(this.supplierId);
        if (!supplier) {
            throw new Error('Supplier not found');
        }

        for (const orderProduct of this.products) {
            const productExists = supplier.products.some(
                supplierProduct => supplierProduct._id.equals(orderProduct.productId)
            );

            if (!productExists) {
                throw new Error(`Product ${orderProduct.productId} does not belong to this supplier`);
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Order', orderSchema);