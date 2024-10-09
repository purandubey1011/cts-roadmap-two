let express = require("express");
const { submitessay} = require("../controllers/exclusive.controllers");
const { isAuthenticated } = require("../middlewares/auth");

let router = express.Router();

// *****************************
// for essay editing services

// essay submission and order creation
router.route("/submit-essay").post(submitessay)

module.exports = router;