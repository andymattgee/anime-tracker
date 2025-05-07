const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mangaSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false },  // We'll skip enforcing this for now
  title: { type: String, required: true },
  chaptersRead: { type: Number, default: 0 },
  totalChapters: { type: Number },
  status: {
    type: String,
    enum: ['Reading', 'Completed', 'Dropped', 'Plan to Read'],
    default: 'Reading'
  },
  score: { type: Number, min: 0, max: 10 },
  notes: { type: String },
  coverImage: { type: String },
  synopsis: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Manga', mangaSchema);