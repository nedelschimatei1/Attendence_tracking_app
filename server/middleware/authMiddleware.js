import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

function verifyToken(req, res, next) {
  // Check if Authorization header exists
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(403).json({ error: 'Access denied. No token provided.' });
  }

  // Extract the token (Bearer <token>)
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: 'Access denied. Invalid token format.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to the request object
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token. Please log in again.' });
  }
}

export default verifyToken;
