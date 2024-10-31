const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization denied. No token provided or incorrect format.' });
  }

  const token = authHeader.split(' ')[1]; 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded; 
    next(); 
  } catch (error) {
    console.error('Token verification failed:', error.message);

    
    const message = error.name === 'TokenExpiredError'
      ? 'Token expired. Please log in again.'
      : 'Invalid token. Authorization denied.';
    res.status(401).json({ message });
  }
};

module.exports = { verifyToken };
