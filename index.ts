const express = require('express');
const cors = require('cors'); // ✅ Added
const bcrypt = require('bcryptjs');
const joi = require('joi');
const app = express();
const port = 3000;

app.use(cors({ origin: '*', methods: ['GET', 'POST'] })); // ✅ Enable CORS
app.use(express.json());


import { Request, Response } from 'express';
 
interface UserDto {
  username: string;
  email: string;
  type: 'user' | 'admin';
  password: string;
}
 
interface UserEntry {
  email: string;
  type: 'user' | 'admin';
  salt: string;
  passwordhash: string;
}
 
// In-memory database mock
const MEMORY_DB: Record<string, UserEntry> = {};
 
app.use(express.json());
// ✅ Helper functions
function getUserByUsername(name: string): UserEntry | undefined {
  return MEMORY_DB[name];
}
 
function getUserByEmail(email: string): UserEntry | undefined {
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
app.post('/register', async (req: Request, res: Response) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: 'Invalid user data', details: error.details });
  }
 
  const { username, email, type, password }: UserDto = value;
 
  if (getUserByUsername(username)) {
    return res.status(409).json({ message: 'Username already exists' });
  }
  if (getUserByEmail(email)) {
    return res.status(409).json({ message: 'Email already exists' });
  }
 
  const salt = await bcrypt.genSalt(10);
  const passwordhash = await bcrypt.hash(password, salt);
 
  MEMORY_DB[username] = { email, type, salt, passwordhash };
 
  res.status(201).json({ message: 'User registered successfully', username });
});
 
// ✅ Login endpoint
app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
 
  const user = getUserByUsername(username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
 
  const isMatch = await bcrypt.compare(password, user.passwordhash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
 
  res.status(200).json({ message: 'Login successful', username });
});
 
app.get('/hello', async (req: Request, res: Response) => {
  res.status(200).json({ message: 'Login successful' });
});
 
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.use(cors());