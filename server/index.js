// const express = require('express');
// const connectDB = require('./config/db'); // Import the database connection
// require('dotenv').config();

// // Initialize Express app
// const app = express();

// // Middleware to parse JSON
// app.use(express.json());

// // Define a simple test route
// app.get('/', (req, res) => {
//   res.send('Disaster Duty System API is running!');
// });

// // Start the server after connecting to the database
// const PORT = process.env.PORT || 5000;

// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// });





// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import connectDB from './config/db.js';
// import router from './routes/AuthRoutes.js';

// dotenv.config();

// // Initialize Express app
// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/auth', router);

// // Connect to MongoDB and start server
// const PORT = process.env.PORT || 5000;
// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// });


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import router from './routes/AuthRoutes.js';
import Dutyrouter from './routes/DutyOrderRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', router);
app.use('/api/duty-orders', Dutyrouter);
app.use('/api/notifications', notificationRoutes);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});