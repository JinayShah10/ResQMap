const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    throw new Error('MONGO_URI environment variable is missing');
  }

  const conn = await mongoose.connect(mongoURI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;
