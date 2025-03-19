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
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cors = require('cors'); // ✅ Added
const bcrypt = require('bcryptjs');
const joi = require('joi');
const app = express();
const port = 3000;
app.use(cors({ origin: '*', methods: ['GET', 'POST'] })); // ✅ Enable CORS
app.use(express.json());
// In-memory database mock
const MEMORY_DB = {};
app.use(express.json());
// ✅ Helper functions
function getUserByUsername(name) {
    return MEMORY_DB[name];
}
function getUserByEmail(email) {
    return Object.values(MEMORY_DB).find((user) => user.email === email);
}
// ✅ Validation schema
const userSchema = joi.object({
    username: joi.string().min(3).max(24).required(),
    email: joi.string().email().required(),
    type: joi.string().valid('user', 'admin').required(),
    password: joi
        .string()
        .min(5)
        .max(24)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).*$/)
        .required(),
});
// ✅ Register endpoint
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
        return res
            .status(400)
            .json({ message: 'Invalid user data', details: error.details });
    }
    const { username, email, type, password } = value;
    if (getUserByUsername(username)) {
        return res.status(409).json({ message: 'Username already exists' });
    }
    if (getUserByEmail(email)) {
        return res.status(409).json({ message: 'Email already exists' });
    }
    const salt = yield bcrypt.genSalt(10);
    const passwordhash = yield bcrypt.hash(password, salt);
    MEMORY_DB[username] = { email, type, salt, passwordhash };
    res.status(201).json({ message: 'User registered successfully', username });
}));
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ message: 'API is working!' });
}));
// ✅ Login endpoint
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = getUserByUsername(username);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = yield bcrypt.compare(password, user.passwordhash);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Login successful', username });
}));
app.get('/hello', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ message: 'Login successful' });
}));
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
app.use(cors());
