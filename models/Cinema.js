const mongoose = require("mongoose");

const cinemaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    movies: [
      {
        movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" }, // Referenca na Movie model
        showtimes: [{ type: String, required: true }], // Datum i vreme (YYYY-MM-DD HH:mm)
        seats: [
          {
            row: { type: Number, required: true },
            number: { type: Number, required: true },
            isReserved: { type: Boolean, default: false },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const Cinema = mongoose.models.Cinema || mongoose.model("Cinema", cinemaSchema);

module.exports = Cinema;
