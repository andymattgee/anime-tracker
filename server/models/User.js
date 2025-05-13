const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required.'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long.'],
    maxlength: [30, 'Username cannot exceed 30 characters.']
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address.']
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    minlength: [6, 'Password must be at least 6 characters long.'] // Basic length validation
  },
  animeList: [{
    type: Schema.Types.ObjectId,
    ref: 'Anime'
  }],
  mangaList: [{
    type: Schema.Types.ObjectId,
    ref: 'Manga'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Note: Password hashing should ideally be handled as a pre-save hook or in the controller/service layer
// For example, using bcrypt:
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = mongoose.model('User', userSchema);