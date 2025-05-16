import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export async function protectSuperAdmin (req, res, next)  {
  try {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check if user is a superadmin
    if (user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Not authorized as Super Admin' });
    }

    // If everything is valid, add user to request object
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

