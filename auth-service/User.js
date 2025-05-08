import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: String,
  email: String,
  password: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const User = mongoose.model('User', UserSchema);

export default User;

// This code defines a Mongoose schema and model for a User entity.
// The UserSchema includes fields for name, email, and createdAt timestamp.
// The createdAt field is automatically set to the current date and time when a new user is created.
// The User model is then exported for use in other parts of the application.
// This model can be used to interact with the users collection in a MongoDB database.
// Example usage:
// const mongoose = require('mongoose');
// const User = require('./User');
// mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });
// const newUser = new User({ name: 'John Doe', email: 'johndoe@example.com' });
// newUser.save()
//   .then(() => console.log('User saved'))
//   .catch(err => console.error('Error saving user:', err))
//   .finally(() => mongoose.connection.close());
// This code connects to a MongoDB database and saves a new user to the users collection.
// It uses the User model defined above to create a new user instance and save it to the database.
// If the save operation is successful, it logs a success message to the console.
// If there is an error, it logs the error message.
// Finally, it closes the database connection.
