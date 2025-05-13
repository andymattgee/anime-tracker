const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mangaSchema = new Schema({
  mangaId: {
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
  source: {
    type: String
  },
  genres: {
    type: [String],
    default: []
  },
  totalChapters: {
    type: Number
  },
  totalVolumes: {
    type: Number
  },
  chaptersRead: {
    type: Number,
    default: 0
  },
  publishedFrom: {
    type: Date
  },
  publishedTo: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Reading', 'Completed', 'Dropped', 'Plan to Read'],
    default: 'Plan to Read'
  },
  userStatus: {
    type: String,
    enum: ['Reading', 'Completed', 'Dropped', 'Plan to Read'],
    default: 'Plan to Read'
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
mangaSchema.index({ mangaId: 1, user: 1 }, { unique: true });

// Create a model from the schema
const Manga = mongoose.model('Manga', mangaSchema);

// Drop the problematic mal_id index if it exists
Manga.collection.dropIndex('mal_id_1')
  .then(() => console.log('Dropped mal_id_1 index from Manga collection'))
  .catch(err => {
    // Ignore error if index doesn't exist
    if (err.code !== 27) {
      console.error('Error dropping index:', err);
    } else {
      console.log('mal_id_1 index not found (which is fine)');
    }
  });

module.exports = Manga;