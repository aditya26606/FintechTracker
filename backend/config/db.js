const mongoose = require('mongoose');
const dns = require('dns');
const fs = require('fs');
const path = require('path');


dns.setServers(['8.8.8.8', '8.8.4.4']);

let dbMode = 'json'; 

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense_tracker';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      family: 4, 
    });
    dbMode = 'mongodb';
    console.log('⚡ Connected to MongoDB Server successfully.');
  } catch (error) {
    dbMode = 'json';
    console.log('⚠️ MongoDB connection failed. Falling back to local JSON database mode.');
    console.log('   Reason:', error.message);

    const dataDir = path.join(__dirname, '../database/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }
};

const getDBMode = () => dbMode;

module.exports = { connectDB, getDBMode };
