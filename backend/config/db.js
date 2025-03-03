const mongoose = require('mongoose');

exports.connectDB = async () => {
    console.log(process.env.MONGO_URI);
    let URI = process.env.MONGO_URI;
    try {
        await mongoose.connect(URI);
        
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};