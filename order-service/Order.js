import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  products: [{ productId: String }],
  user: String,
  totalPrice: Number,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;

// This code defines a Mongoose schema and model for an Order entity.
// The OrderSchema includes fields for products (an array of product IDs), user (the ID of the user who placed the order), totalPrice (the total price of the order), and createdAt (a timestamp for when the order was created).
// The createdAt field is automatically set to the current date and time when a new order is created.
// The Order model is then exported for use in other parts of the application.
// This model can be used to interact with the orders collection in a MongoDB database.
// Example usage:
// const mongoose = require('mongoose');
// const Order = require('./Order');
// mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });
// const newOrder = new Order({ products: [{ productId: '123' }], user: '456', totalPrice: 100 });
// newOrder.save()
//   .then(() => console.log('Order saved'))
//   .catch(err => console.error('Error saving order:', err))
//   .finally(() => mongoose.connection.close());
// This code connects to a MongoDB database and saves a new order to the orders collection.
// It uses the Order model defined above to create a new order instance and save it to the database.
// If the save operation is successful, it logs a success message to the console.
// If there is an error, it logs the error message.
// Finally, it closes the database connection.
