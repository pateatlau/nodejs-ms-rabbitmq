import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import User from './User.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/auth-service';

mongoose.connect(
  MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => console.log('Auth-Service DB connected')
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (password !== user.password) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  const payload = {
    name: user.name,
    email,
  };

  jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
    if (err) {
      return res.status(500).json({ message: 'Error signing JWT' });
    }

    return res.status(200).json({
      token,
      user: {
        name: user.name,
        email,
      },
    });
  });
});

app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const newUser = User({ name, email, password });
  newUser.save();
  return res.status(201).json({ message: 'New user successfully created' });
});

app.listen(PORT, () => console.log(`Auth-Service running on port ${PORT}`));

// This code sets up an Express server for an authentication service.
// It connects to a MongoDB database using Mongoose and defines two main routes: /auth/login and /auth/register.
// The /auth/login route handles user login by verifying the provided email and password.
// If the credentials are valid, it generates a JWT token and returns it along with user information.
// The /auth/register route handles user registration by creating a new user in the database.
// It checks if the user already exists and returns an appropriate response.
// The server listens on a specified port and logs a message when it starts.
// The code also uses dotenv to manage environment variables, cors for cross-origin resource sharing, and includes error handling for various scenarios.
// The JWT secret is stored in an environment variable for security.
// This code is a basic implementation of an authentication service and can be extended with additional features such as password hashing, email verification, and more.
// It provides a foundation for building a secure authentication system in a web application.
