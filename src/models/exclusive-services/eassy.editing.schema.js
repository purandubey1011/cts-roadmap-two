const mongoose = require('mongoose');

const essayediting = new mongoose.Schema({
    essaytype: {
        type: String,
        required: true,
        trim: true,
    },
    essayfile: {
        type: String,
        required: true,
        trim: true,
    },
    instructions: {
        type: String,
    },
    userid: {
        type:String,
        required: true
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    paymentId: {
        type: String,
        unique: true,
        sparse: true // Allow null values initially
    },
    signature: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed'],
        default: 'created'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
    
}, { timestamps: true });

const essay = mongoose.model('essay', essayediting);

module.exports = essay;
