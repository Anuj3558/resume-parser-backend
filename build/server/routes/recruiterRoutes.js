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
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
router.get("/getAssignedJobs/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getJobs");
        const { id } = req.params;
        const jobs = yield models_1.Job.find({ assigned: { $in: [id] } });
        res.status(200).json(jobs);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}));
router.get("/getAllJobs/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const objectId = new mongoose_1.default.Types.ObjectId(id);
        console.log(id, objectId);
        const jobs = yield models_1.Job.find({
            $or: [{ assigned: { $in: [objectId] } }, { initiator: objectId }]
        });
        res.status(200).json(jobs);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error });
    }
}));
exports.default = router;
