import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const verifysUser = async (req, res, next) => {
    try {
        // Extract token from headers
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

        if (!token) {

            return res.status(400).json({ success: false, error: "Token not provided" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // If token is invalid, decoded will be null or throw an error
        if (!decoded || !decoded._id) {
            return res.status(401).json({ success: false, error: "Token not valid" });
        }

        // Find the user by decoded._id and exclude the password field
        const user = await User.findById(decoded._id).select('-password');

        // If user not found, send an error
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Attach the user to the request object
        req.user = user;

        // Proceed to the next middleware
        next();
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

export default verifysUser;
