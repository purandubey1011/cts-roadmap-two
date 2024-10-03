const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const Portfolio = require("../models/portfolio.schema.js");
let Payment = require("../models/payment.schema.js");
const ErrorHandler = require("../utils/ErrorHandler.js");


// create portfolio
exports.createpayment = catchAsyncErrors(async (req, res, next) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id);
        if (!portfolio) {
            return res.status(404).send('Portfolio item not found');
        }

        const order = await portfolio.createOrder();

        // Save initial payment details
        const payment = new Payment({
            orderId: order.id,
            portfolioId: portfolio._id,
            amount: order.amount,
            status: 'created'
        });
        await payment.save();

        console.log('order',order)
        res.status(200).json(order);
    } catch (error) {
        console.log('error create payment :',error)
        res.status(500).json({ message: error.message });
    }
});

// verify portfolio
exports.verifypayment = catchAsyncErrors(async (req, res, next) => {
    try {
        const { order_id, payment_id, signature, portfolio_id } = req.body;
        const portfolio = await Portfolio.findById(portfolio_id);
        if (!portfolio) {
            return res.status(404).send('Portfolio item not found');
        }

        const paymentDetails = {
            razorpay_order_id: order_id,
            razorpay_payment_id: payment_id,
            razorpay_signature: signature
        };

        const isValid = portfolio.verifyPayment(paymentDetails);
        if (isValid) {
            portfolio.purchased += 1;
            await portfolio.save();

            // Update payment details
            const payment = await Payment.findOne({ orderId: order_id });
            payment.paymentId = payment_id;
            payment.signature = signature;
            payment.status = 'paid';
            await payment.save();

            res.status(200).send('Payment verified and purchase recorded');
        } else {
            // Update payment status to failed
            const payment = await Payment.findOne({ orderId: order_id });
            payment.status = 'failed';
            await payment.save();

            res.status(400).send('Invalid payment signature');
        }
    } catch (error) {
        res.status(500).send('Error verifying payment: ' + error.message);
    }
});