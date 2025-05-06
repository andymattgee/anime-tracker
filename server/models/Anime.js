const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const animeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false },  // we'll skip this for now
  title: { type: String, required: true },
  episodesWatched: { type: Number, default: 0 },
  totalEpisodes: { type: Number },
  status: {
    type: String,
    enum: ['Watching', 'Completed', 'Dropped', 'Plan to Watch'],
    default: 'Watching'
  },
  score: { type: Number, min: 0, max: 10 },
  notes: { type: String },
  coverImage: { type: String },
  synopsis: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Anime', animeSchema);