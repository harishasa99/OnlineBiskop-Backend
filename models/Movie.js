const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: { type: String, required: true },
    director: { type: String, required: true },
    duration: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    categories: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    votes: { type: Number, default: 0 },
    cinemas: [
      {
        cinemaId: { type: mongoose.Schema.Types.ObjectId, ref: "Cinema" },
        showtimes: [{ type: String, required: true }],
      },
    ],
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);
module.exports = Movie;
