import express from 'express';
import mongoose from 'mongoose';
import amqp from 'amqplib';
import dotenv from 'dotenv';
import cors from 'cors';
import Product from './Product.js';
import isAuthenticated from '../isAuthenticated.js';

let order, channel, connection;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/product-service';
const RABBITMQ_URI = process.env.RABBITMQ_URI || 'amqp://localhost:5672';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(
  MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => console.log('Product-Service DB connected')
);

// RabbitMQ connection:
// IMPORTANT: RabbitMQ must be running before starting the product-service and order-service.
// Run the following command to start RabbitMQ: (This app supports RabbitMQ 3 only, and not the latest version 4)
// 1) Latest version:
// docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management
// 2) Previous version:
// docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
async function connectRabbitMQ() {
  const amqpServer = RABBITMQ_URI;
  // 1) Connect to RabbitMQ server
  connection = await amqp.connect(amqpServer);
  // 2) Create a channel on that connection
  channel = await connection.createChannel();
  // 3) Assert a queue named 'PRODUCT' (create it if it doesn't exist)
  await channel.assertQueue('PRODUCT');
  console.log('RabbitMQ connected');
}
connectRabbitMQ();

app.post('/product/buy', isAuthenticated, async (req, res) => {
  const { ids } = req.body;
  const products = await Product.find({ _id: { $in: ids } });
  channel.sendToQueue(
    'ORDER',
    Buffer.from(JSON.stringify({ products, userEmail: req.user.email }))
  );

  channel.consume('PRODUCT', (data) => {
    order = JSON.parse(data.content);
    console.log('Order data received:', JSON.stringify(order));
  });

  return res.status(200).json({ message: 'Order placed successfully', order });
});

app.post('/product/create', isAuthenticated, async (req, res) => {
  const { name, description, price } = req.body;
  const newProduct = new Product({ name, description, price });
  await newProduct.save();
  return res
    .status(201)
    .json({ message: 'Product created successfully', newProduct });
});

app.listen(PORT, () => console.log(`Product-Service running on port ${PORT}`));

// This code defines a product service that allows users to create products and place orders.
// It uses Express for the server, Mongoose for MongoDB interactions, and RabbitMQ for message queuing.
// The service connects to a MongoDB database and a RabbitMQ message broker.
// It defines two main routes: /product/buy for placing orders and /product/create for creating new products.
// The /product/buy route requires authentication and sends the order data to the ORDER queue in RabbitMQ.
// The /product/create route allows authenticated users to create new products and save them to the database.
// The server listens on a specified port and logs a message when it starts successfully.
// The connectRabbitMQ function establishes a connection to the RabbitMQ server and sets up the necessary queues.
// The server uses the isAuthenticated middleware to protect routes that require authentication.
// The order data is sent to the ORDER queue in RabbitMQ, and the server listens for incoming messages on the PRODUCT queue.
// The order data is logged to the console when received.
// The server responds to the client with a success message and the order data.
// The Product model is imported from the Product.js file, which defines the schema and model for the product entity.
// The isAuthenticated middleware is imported from the isAuthenticated.js file, which checks if the user is authenticated before allowing access to certain routes.
// The server uses the cors middleware to enable Cross-Origin Resource Sharing, allowing requests from different origins.
// The express.json() and express.urlencoded() middleware are used to parse incoming request bodies in JSON and URL-encoded formats, respectively.
// The dotenv package is used to load environment variables from a .env file, allowing for configuration of the MongoDB and RabbitMQ connection strings.
