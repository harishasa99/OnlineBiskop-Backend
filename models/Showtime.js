const mongoose = require("mongoose");

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cinema",
      required: true,
    },
    datetime: { type: Date, required: true },
    bookedSeats: [{ type: Number, default: [] }], // Lista rezervisanih sedišta
  },
  { timestamps: true }
);

module.exports = mongoose.model("Showtime", showtimeSchema);
