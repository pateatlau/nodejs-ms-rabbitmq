import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ProductSchema = new Schema({
  name: String,
  description: String,
  price: Number,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
const Product = mongoose.model('Product', ProductSchema);

export default Product;

// This code defines a Mongoose schema and model for a Product entity.
// The ProductSchema includes fields for name, description, price, and createdAt timestamp.
// The createdAt field is automatically set to the current date and time when a new product is created.
// The Product model is then exported for use in other parts of the application.
// This model can be used to interact with the products collection in a MongoDB database.
// Example usage:
// const mongoose = require('mongoose');
// const Product = require('./Product');
// mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });
// const newProduct = new Product({ name: 'Product 1', description: 'Description of Product 1', price: 100 });
// newProduct.save()
//   .then(() => console.log('Product saved'))
//   .catch(err => console.error('Error saving product:', err))
//   .finally(() => mongoose.connection.close());
// This code connects to a MongoDB database and saves a new product to the products collection.
// It uses the Product model defined above to create a new product instance and save it to the database.
// If the save operation is successful, it logs a success message to the console.
// If there is an error, it logs the error message.
// Finally, it closes the database connection.
