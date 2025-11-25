const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    console.log('Extracted token:', token);
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Handle mock token for demo purposes
    if (token === 'mock-token') {
      console.log('Using mock token authentication');
      // Create or find a demo user
      let demoUser = await User.findOne({ email: 'demo@example.com' });
      if (!demoUser) {
        console.log('Creating new demo user');
        demoUser = new User({
          name: 'Admin Login',
          email: 'admin@example.com',
          password: 'admin123',
          role: 'admin'
        });
        await demoUser.save();
        console.log('Demo user created:', demoUser._id);
      } else {
        console.log('Found existing demo user:', demoUser._id);
      }
      req.user = demoUser;
      return next();
    }

    console.log('Attempting JWT verification');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = { auth, requireRole };




