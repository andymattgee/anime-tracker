const mongoose = require('mongoose');
const { Schema } = mongoose;

const mangaSchema = new Schema({
  // User-specific tracking data
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false }, // Linked user (optional for now)
  chaptersRead: { type: Number, default: 0 },
  userStatus: {
    type: String,
    enum: ['Reading', 'Completed', 'Dropped', 'Plan to Read'],
    default: 'Plan to Read'
  },
  userScore: { type: Number, min: 0, max: 10, required: false },
  userNotes: { type: String, default: '' },

  // Data from Jikan API
  mal_id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  totalChapters: { type: Number, required: false },
  totalVolumes: { type: Number, required: false },
  coverImage: { type: String, required: false },
  synopsis: { type: String, required: false },
  apiStatus: { type: String, required: false }, // "Finished", "Publishing", etc.
  apiScore: { type: Number, required: false },
  source: { type: String, required: false }, // e.g., "Original", "Web Manga"
  genres: [{ type: String }],
  publishedFrom: { type: Date, required: false },
  publishedTo: { type: Date, required: false }

}, { timestamps: true });

module.exports = mongoose.model('Manga', mangaSchema);