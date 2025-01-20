import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });
const authRoutes = express.Router();

authRoutes.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const existingUser = await User.findOne({ where: { username } });
        if(existingUser){
            return res.status(409).json({ error: 'Conflict: Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            password: hashedPassword,
            role: role || 'participant'
        });
        return res.status(201).json({
            message: 'User registered successfully',
            role: user.role
         });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Registration failed' });
    }
});

authRoutes.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({where:{ username: username }});
        if (!user) {
            return res.status(403).json({ error: 'Authentication failed: non-recognized username' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Authentication failed: wrong password' });
        }
        const token  = jwt.sign(
            { 
            userId: user.id,
            role: user.role 
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200).json({
            token,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});
   
export default authRoutes;