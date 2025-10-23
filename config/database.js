const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://gauravpawar904_patel:xBAquzKNZCcp88kG@cluster0.ufhe8af.mongodb.net/Patel_Test_v2?retryWrites=true&w=majority&appName=Cluster0');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  mongoose
};
