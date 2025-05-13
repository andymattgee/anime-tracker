const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for index fix...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function fixIndexes() {
  try {
    // Get references to the collections directly
    const animeCollection = mongoose.connection.collection('animes');
    const mangaCollection = mongoose.connection.collection('mangas');
    
    console.log('Fetching current indexes...');
    
    // List current indexes
    const animeIndexes = await animeCollection.indexes();
    const mangaIndexes = await mangaCollection.indexes();
    
    console.log('Current anime indexes:', animeIndexes);
    console.log('Current manga indexes:', mangaIndexes);
    
    // Drop the problematic indexes
    console.log('Dropping problematic indexes...');

    // Check if mal_id_1 index exists on anime collection
    const hasMalIdIndexAnime = animeIndexes.some(idx => idx.name === 'mal_id_1');
    if (hasMalIdIndexAnime) {
      console.log('Dropping mal_id_1 index from anime collection...');
      await animeCollection.dropIndex('mal_id_1');
      console.log('Dropped mal_id_1 index from anime collection.');
    } else {
      console.log('No mal_id_1 index found on anime collection.');
    }
    
    // Check if mal_id_1 index exists on manga collection
    const hasMalIdIndexManga = mangaIndexes.some(idx => idx.name === 'mal_id_1');
    if (hasMalIdIndexManga) {
      console.log('Dropping mal_id_1 index from manga collection...');
      await mangaCollection.dropIndex('mal_id_1');
      console.log('Dropped mal_id_1 index from manga collection.');
    } else {
      console.log('No mal_id_1 index found on manga collection.');
    }
    
    // Create the correct compound indexes
    console.log('Creating correct compound indexes...');
    
    await animeCollection.createIndex({ animeId: 1, user: 1 }, { unique: true });
    await animeCollection.createIndex({ mal_id: 1, user: 1 }); // Non-unique index for lookups
    
    await mangaCollection.createIndex({ mangaId: 1, user: 1 }, { unique: true });
    await mangaCollection.createIndex({ mal_id: 1, user: 1 }); // Non-unique index for lookups
    
    console.log('Index operations completed successfully.');
    
    const updatedAnimeIndexes = await animeCollection.indexes();
    const updatedMangaIndexes = await mangaCollection.indexes();
    
    console.log('Updated anime indexes:', updatedAnimeIndexes);
    console.log('Updated manga indexes:', updatedMangaIndexes);
    
    console.log('Index fix completed successfully');
  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  }
}

// Run the function
fixIndexes(); 