const mongoose = require('mongoose');
require('dotenv').config();

async function inspectCollections() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get collection information
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check indexes on the reviews collection
    const reviewIndexes = await db.collection('reviews').indexes();
    console.log('\nReview Indexes:');
    console.log(JSON.stringify(reviewIndexes, null, 2));
    
    // Get a sample document
    const sampleReview = await db.collection('reviews').findOne();
    console.log('\nSample Review Document:');
    console.log(JSON.stringify(sampleReview, null, 2));
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error inspecting collections:', error);
  }
}

inspectCollections();
