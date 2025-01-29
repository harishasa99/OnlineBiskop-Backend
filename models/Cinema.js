const mongoose = require("mongoose");

const cinemaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    movies: [
      {
        movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
        showtimes: [String], // Lista termina (npr. ["18:00", "20:30"])
        seats: [
          {
            row: Number,
            number: Number,
            isReserved: { type: Boolean, default: false },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const Cinema = mongoose.model("Cinema", cinemaSchema);
module.exports = Cinema;
