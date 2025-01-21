// routes/userRoutes.js
import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import verifyToken from '../middleware/authMiddleware.js';

const userRoutes = express.Router();

userRoutes.get('/', verifyToken, async (req, res) => {
  try {
    // Check if user is event organizer
    if (req.user.role !== 'eventOrganizer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await User.findAll({
      attributes: ['id', 'username', 'role'],
      order: [['username', 'ASC']]
    });

    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

userRoutes.get('/:id', verifyToken, async (req, res) => {
  try { 
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'role']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

userRoutes.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'username', 'role']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

userRoutes.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'eventOrganizer' && req.user.userId !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { username, password } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    if (username) user.username = username;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();

    const { password: _, ...userResponse } = user.toJSON();

    res.status(200).json(userResponse);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

userRoutes.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'eventOrganizer') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});


export default userRoutes;