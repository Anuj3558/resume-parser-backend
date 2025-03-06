import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models';

const router = express.Router();
const JWT_SECRET = 'Danalitics'; // In production, use environment variable

// Demo user - In production, use a database

const demoUser = {
  name: 'Admin',
  username: 'admin',
  password: 'admin',
  email: 'admin@gmail.com',
  role: 'admin',
  status:"ACTIVE" // Optional: Add a role for the demo user
};

// Function to insert demo credentials into the database
const insertDemoCredentials = async () => {
  try {
    // Check if the demo user already exists
    const existingUser = await User.findOne({ username: demoUser.username });
    if (!existingUser) {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(demoUser.password, 10);

      // Create the demo user
      await User.create({
        name: demoUser.name,
        username: demoUser.username,
        password: hashedPassword,
        email: demoUser.email,
        role: demoUser.role,
        status: demoUser.status
      });

      console.log('Demo credentials inserted successfully.');
    } else {
      console.log('Demo user already exists.');
    }
  } catch (error) {
    console.error('Error inserting demo credentials:', error);
  }
};

// Insert demo credentials when the server starts
insertDemoCredentials();
router.post('/login', async (req:any, res:any) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user: any = await User.findOne({ email:username });
    if (!user) {
     
      return res.status(401).json({ message: "Invalid credentials" });

    }

    // Validate password
    const isPasswordValid: boolean = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  if(user.status === "INACTIVE"){
    return res.status(401).json({ message: "User is inactive" });
  }
    // Generate JWT token
    const token: string = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status:user.status // Optional: Include role in the token
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send response
    res.json({
      token,
      user: {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status:user.status // Optional: Include role in the response
      },
    });
    console.log(res.json)
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;