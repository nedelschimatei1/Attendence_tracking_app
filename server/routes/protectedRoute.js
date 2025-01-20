import express from 'express';
import verifyToken from '../middleware/authMiddleware.js';

const protectedRoute = express.Router();

protectedRoute.get('/', verifyToken, (req, res) => {
    res.status(200).json({
      message: "User verified: " +  req.user.userId,
      role: req.user.role
    });
  });

export default protectedRoute;