import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

async function isAuthenticated(req, res, next) {
  const token = req.headers['authorization'].split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.json({ message: err });
    }

    req.user = user;
    next();
  });
}

export default isAuthenticated;

// This middleware checks if the user is authenticated by verifying the JWT token.
// If the token is valid, it attaches the user information to the request object and calls next() to proceed to the next middleware or route handler.
// If the token is invalid, it sends a JSON response with the error message.
// This is useful for protecting routes that require authentication, ensuring that only authenticated users can access them.
// Example usage:
// const express = require('express');
// const isAuthenticated = require('./isAuthenticated');
// const app = express();
// app.get('/protected', isAuthenticated, (req, res) => {
//   res.json({ message: 'This is a protected route', user: req.user });
// });
// In this example, the '/protected' route is protected by the isAuthenticated middleware.
// Only users with a valid JWT token can access this route.
