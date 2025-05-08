import express from 'express';
import mongoose from 'mongoose';
import amqp from 'amqplib';
import dotenv from 'dotenv';
import cors from 'cors';
import Order from './Order.js';
import isAuthenticated from '../isAuthenticated.js';

let channel, connection;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/order-service';
const RABBITMQ_URI = process.env.RABBITMQ_URI || 'amqp://localhost:5672';

mongoose.connect(
  MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => console.log('Order-Service DB connected')
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function createOrder(products, userEmail) {
  let total = 0;
  for (let t = 0; t < products.length; t++) {
    total += products[t].price;
  }

  const newOrder = new Order({
    products,
    user: userEmail,
    totalPrice: total,
  });

  newOrder.save();
  return newOrder;
}

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
  // 3) Assert a queue named 'ORDER' (create it if it doesn't exist)
  await channel.assertQueue('ORDER');
  console.log('RabbigMQ connected');
}

connectRabbitMQ().then(() => {
  channel.consume('ORDER', (data) => {
    console.log('Order data received');
    const { products, userEmail } = JSON.parse(data.content);
    const newOrder = createOrder(products, userEmail);
    console.log('new order created', newOrder);
    channel.ack(data);
    channel.sendToQueue('PRODUCT', Buffer.from(JSON.stringify({ newOrder })));
    console.log('Order data sent to PRODUCT queue');
  });
});

app.listen(PORT, () => console.log(`Order-Service running on port ${PORT}`));

// This code sets up an Express server for an order service that connects to a MongoDB database and RabbitMQ message broker.
// It listens for incoming messages on the 'ORDER' queue, processes the order data, and sends it to the 'PRODUCT' queue.
// The server uses the isAuthenticated middleware to protect routes that require authentication.
// The createOrder function calculates the total price of the products and saves the order to the database.
// The connectRabbitMQ function establishes a connection to the RabbitMQ server and sets up the necessary queues.
// The server listens on a specified port and logs a message when it starts successfully.
