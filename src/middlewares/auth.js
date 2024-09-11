const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/ErrorHandler");
const { catchAsyncErrors } = require("./catchAsyncErrors");
const User = require("../models/user.schema");

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    let token;
    token = req.cookies.jwt;

    if (!token) {
        console.error("No token found in cookies");
        return next(
            new ErrorHandler("Please login to access the resource", 401)
        );
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded user ID:", decoded.userId);

        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            console.error("User not found for ID:", decoded.userId);
            return next(
                new ErrorHandler("User not found", 404)
            );
        }

        req.user = user;
        req.id = user;
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        return next(
            new ErrorHandler("Unauthorized access", 401)
        );
    }
});