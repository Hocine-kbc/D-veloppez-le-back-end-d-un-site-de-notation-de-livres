const mongoose = require('mongoose');

//////////////// gere le champ d'ajout de livre /////////////////
const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },

  ratings: [
    {
      userId: String,
      grade: Number,
    },
  ],
  averageRating: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Book', bookSchema);
