const Razorpay = require("razorpay");
const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const Essay = require("../models/exclusive-services/eassy.editing.schema.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const User = require("../models/user.schema.js");
const ImageKit = require("../utils/imagekit.js").initImageKit();

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_APT_SECRET
});

// Submit essay
exports.submitessay = catchAsyncErrors(async (req, res, next) => {
    try {
        let { instructions, essaytype, price, id } = req.body;
        
        if (!instructions || !essaytype || !price || !id) {
            return next(new ErrorHandler("All fields are required", 400));
        }

        if(!req.files){
            return next(new ErrorHandler("Please upload the essay file", 400));
        }
        // console.log(req.files)

        let user = await User.findById(id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const options = {
            amount: price * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_${id}`, // Use a unique identifier for the receipt
            // payment_capture: 1, // Auto capture payment, so that the payment is captured as soon as it is created
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return next(new ErrorHandler("Error creating Razorpay order", 500));
        }

        // Save the essay file in ImageKit and get the URL
        const essayFile = req.files.essayfile;
        
        const essaylink = await ImageKit.upload({
            file: essayFile.data, // The file buffer to be uploaded
            fileName: essayFile.name, // The name with which the file has to be uploaded
            folder: "/services/essay-editing", // The folder in which the file has to be uploaded
        });

        // Save initial payment details without paymentId
        const payment = new Essay({
            essaytype,
            essayfile: essaylink.url,
            instructions,
            orderId: order.id,
            amount: price,
            status: "created",
            userid: id
        });
        await payment.save();

        res.status(200).json({
            success: true,
            orderId: order.id,
            message: "Essay submitted successfully",
        });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

// verify payment
exports.essayverifypayment = catchAsyncErrors(async (req, res, next) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;
      const paymentDetails = {
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
      };
  
      const isValid =await Essay.verifyPayment(paymentDetails);
      if (isValid) {
        // Update payment details
        const payment = await Essay.findOne({ orderId: razorpay_order_id });
  
        if (!payment) {
          return res.status(404).json({ message: "Payment record not found" });
        }
  
        payment.paymentId = razorpay_payment_id;
        payment.signature = razorpay_signature;
        payment.status = "paid";
  
        await payment.save();
        res.redirect(
          `http://localhost:5173/portfolio/paymentsuccess/${razorpay_payment_id}`
        );
      } else {
        // Update payment status to failed
        const payment = await Essay.findOne({ orderId: razorpay_order_id });
  
        if (!payment) {
          return res.status(404).json({ message: "Payment record not found" });
        }
  
        payment.status = "failed";
        await payment.save();
  
        res.status(400).json({
          message: "Invalid payment signature",
          status: payment.status,
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error verifying payment: " + error.message });
    }
  });