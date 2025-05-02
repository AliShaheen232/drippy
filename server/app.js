const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db'); // Database connection function
const tokenRoutes = require('./routes/tokenRoutes'); // Import routes

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Body parser middleware
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Use routes
app.use('/api', tokenRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the XRPL Token Issuance API');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
