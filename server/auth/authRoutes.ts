import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Demo user - In production, use a database
const demoUser = {
  email: 'admin@gmail.com',
  // Password: 'admin'
  password: 'admin',

};

router.post('/login', async (req:any, res:any) => {
  try {
    const { username, password } = req.body;
    console.log(username,password)

    // Check if user exists
    if (username !== demoUser.email) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log("hii")
    // Verify password
    const isValidPassword = password===demoUser.password;
    console.log(isValidPassword)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        email: demoUser.email,
        
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send response
    res.json({
      token,
      user: {
        email: demoUser.email,
        
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;