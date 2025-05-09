const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const animeSchema = new Schema({
  // User-specific tracking data
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false }, // Link to the user who added this
  episodesWatched: { type: Number, default: 0 },
  userStatus: { // Renamed from 'status'
    type: String,
    enum: ['Watching', 'Completed', 'Dropped', 'Plan to Watch'],
    default: 'Plan to Watch' // Default to 'Plan to Watch' when added from explore
  },
  userScore: { type: Number, min: 0, max: 10, required: false }, // Renamed from 'score', make optional
  userNotes: { type: String, default: '' }, // Renamed from 'notes'

  // Data primarily from Jikan API
  mal_id: { type: Number, required: true, unique: true }, // MyAnimeList ID, should be unique
  title: { type: String, required: true },
  totalEpisodes: { type: Number, required: false }, // API might not always provide this
  coverImage: { type: String, required: false },
  synopsis: { type: String, required: false },
  apiStatus: { type: String, required: false }, // e.g., "Finished Airing", "Currently Airing"
  apiScore: { type: Number, required: false }, // Community score from API
  trailerUrl: { type: String, required: false },
  source: { type: String, required: false }, // e.g., "Manga", "Original"
  genres: [{ type: String }], // Array of genre names
  airedFrom: { type: Date, required: false },
  airedTo: { type: Date, required: false }

}, { timestamps: true });

module.exports = mongoose.model('Anime', animeSchema);