const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/ErrorHandler");
const { catchAsyncErrors } = require("./catchAsyncErrors");
const User = require("../models/user.schema");

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    let token;

    token = req.cookies.jwt;

    if (!token) {
        return next(
            new ErrorHandler("Please login in to access the resource", 401)
        );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
        return next(
            new ErrorHandler("User not found", 404)
        );
    }

    req.user = user;
    req.id = user;
    next();
}); 