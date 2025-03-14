"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const models_1 = require("../models");
const router = express_1.default.Router();
const JWT_SECRET = 'Danalitics'; // In production, use environment variable
// Demo user - In production, use a database
const demoUser = {
    name: 'Admin',
    username: 'admin',
    password: 'admin',
    email: 'admin@gmail.com',
    role: 'admin',
    category: "ADMIN",
    status: "ACTIVE" // Optional: Add a role for the demo user
};
// Function to insert demo credentials into the database
const insertDemoCredentials = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if the demo user already exists
        const existingUser = yield models_1.User.findOne({ username: demoUser.username });
        if (!existingUser) {
            // Hash the password before saving
            const hashedPassword = yield bcryptjs_1.default.hash(demoUser.password, 10);
            // Create the demo user
            yield models_1.User.create({
                name: demoUser.name,
                username: demoUser.username,
                password: hashedPassword,
                email: demoUser.email,
                role: demoUser.role,
                category: demoUser.category,
                status: demoUser.status
            });
            console.log('Demo credentials inserte successfully.');
        }
        else {
            console.log('Demo user already exists.');
        }
    }
    catch (error) {
        console.error('Error inserting demo credentials:', error);
    }
});
// Insert demo credentials when the server starts
insertDemoCredentials();
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Check if user exists
        const user = yield models_1.User.findOne({ email: username });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // Validate password
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (user.status === "INACTIVE") {
            return res.status(401).json({ message: "User is inactive" });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            username: user.username,
            email: user.email,
            role: user.category,
            status: user.status // Optional: Include role in the token
        }, JWT_SECRET, { expiresIn: "1h" });
        // Send response
        res.json({
            token,
            user: {
                userId: user._id,
                username: user.username,
                email: user.email,
                role: user.category,
                status: user.status // Optional: Include role in the response
            },
        });
        console.log(user.category);
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
}));
exports.default = router;
