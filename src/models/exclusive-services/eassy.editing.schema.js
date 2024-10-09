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

// Method to verify payment
essayediting.statics.verifyPayment = function(paymentDetails) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentDetails;
        const hmac = crypto.createHmac('sha256', razorpay.key_secret);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generatedSignature = hmac.digest('hex');
        return generatedSignature === razorpay_signature;
    } catch (error) {
        console.log("error verify payment :", error);
        return false;
    }
};

const essay = mongoose.model('essay', essayediting);

module.exports = essay;
