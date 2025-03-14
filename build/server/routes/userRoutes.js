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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const models_1 = require("../models");
const bcryptjs_1 = require("bcryptjs");
const router = express_1.default.Router();
router.get("/getUsers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield models_1.User.find();
        res.status(200).json(users);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
}));
router.post("/addUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, status } = req.body;
        console.log(req.body);
        let { password } = req.body;
        const category = "USER";
        if (!name || !email || !status || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }
        password = yield (0, bcryptjs_1.hash)(password, 10);
        const user = new models_1.User({ name, email, status, password, category });
        yield user.save();
        res.status(201).json({ message: "Users added successfully" });
    }
    catch (error) { }
}));
// Update Job Category
router.put("/updateUser/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, email, status } = req.body;
        let password = req.body.password;
        password = yield (0, bcryptjs_1.hash)(password, 10);
        if (!name || !email || !status || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }
        const updatedUser = yield models_1.User.findByIdAndUpdate(id, {
            name,
            email,
            password,
            status,
        }).exec();
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User updated successfully" });
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.put("/updateUserStatus/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield models_1.User.findById(id).exec();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        else {
            if (user.status === "ACTIVE") {
                user.status = "INACTIVE";
            }
            else {
                user.status = "ACTIVE";
            }
            yield user.save();
            res.status(200).json({ message: "User status updated successfully" });
        }
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
// Delete Job Category
router.delete("/deleteUser/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield models_1.User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) { }
}));
exports.default = router;
