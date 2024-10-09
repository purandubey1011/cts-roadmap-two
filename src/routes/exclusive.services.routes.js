let express = require("express");
const { submitessay,essayverifypayment,payment_success_essay} = require("../controllers/exclusive.controllers");
const { isAuthenticated } = require("../middlewares/auth");

let router = express.Router();

// *****************************
// for essay editing services

// essay submission and order creation
router.route("/submit-essay").post(submitessay)

// essay submission and order creation
// route for verify payment
router.route("/essay-verify-payment").post(essayverifypayment)

// route for verify payment
router.route("/payment-success-essay/:payid").post(payment_success_essay)

module.exports = router;