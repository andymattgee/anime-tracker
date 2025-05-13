const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const animeSchema = new Schema({
  animeId: {
    type: Number,
    required: true
  },
  mal_id: {
    type: Number
  },
  title: {
    type: String,
    required: true
  },
  title_english: {
    type: String
  },
  image: {
    type: String
  },
  coverImage: {
    type: String
  },
  synopsis: {
    type: String
  },
  apiStatus: {
    type: String
  },
  apiScore: {
    type: Number
  },
  trailerUrl: {
    type: String
  },
  source: {
    type: String
  },
  genres: {
    type: [String],
    default: []
  },
  totalEpisodes: {
    type: Number
  },
  episodesWatched: {
    type: Number,
    default: 0
  },
  airedFrom: {
    type: Date
  },
  airedTo: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Watching', 'Completed', 'Dropped', 'Plan to Watch'],
    default: 'Plan to Watch'
  },
  userStatus: {
    type: String,
    enum: ['Watching', 'Completed', 'Dropped', 'Plan to Watch'],
    default: 'Plan to Watch'
  },
  userScore: {
    type: Number,
    min: 0,
    max: 10
  },
  userNotes: {
    type: String,
    default: ''
  },
  user: {
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Only keep a compound index for user uniqueness
animeSchema.index({ animeId: 1, user: 1 }, { unique: true });

// Create a model from the schema
const Anime = mongoose.model('Anime', animeSchema);

// Drop the problematic mal_id index if it exists
Anime.collection.dropIndex('mal_id_1')
  .then(() => console.log('Dropped mal_id_1 index from Anime collection'))
  .catch(err => {
    // Ignore error if index doesn't exist
    if (err.code !== 27) {
      console.error('Error dropping index:', err);
    } else {
      console.log('mal_id_1 index not found (which is fine)');
    }
  });

module.exports = Anime;