const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',     require('./src/routes/auth'));
app.use('/api/clients',  require('./src/routes/clients'));
app.use('/api/invoices', require('./src/routes/invoices'));

// Health check
app.get('/', (req, res) => res.json({ message: 'InvoiceOS API running' }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
};

async function startInMemoryMongo() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('Using in-memory MongoDB for development:', uri);
  await mongoose.connect(uri, mongooseOptions);
  return mongod;
}

async function startServer() {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

async function connectMongo() {
  if (!MONGO_URI) {
    console.warn('MONGO_URI is not defined; starting in-memory MongoDB.');
    return startInMemoryMongo();
  }

  console.log('Connecting to MongoDB...', MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI, mongooseOptions);
    console.log('MongoDB connected');
    return null;
  } catch (err) {
    console.warn('Local MongoDB connection failed, falling back to in-memory MongoDB.');
    console.warn(err.message || err);
    return startInMemoryMongo();
  }
}

connectMongo()
  .then(() => startServer())
  .catch((err) => {
    console.error('Unable to start server:', err);
    process.exit(1);
  });
