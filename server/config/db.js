const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DB_NAME || "golden-gym";

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Add it to your .env file.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName: databaseName,
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    if (error && error.code === 8000) {
      throw new Error(
        "MongoDB Atlas authentication failed. Check that MONGODB_URI uses a Database Access user, the password is correct, and the Atlas user has access to the cluster."
      );
    }

    throw error;
  }

  return mongoose.connection;
};

module.exports = connectDB;
