const express = require("express");
const Showtime = require("../models/Showtime");

const router = express.Router();

var mongoose = require('mongoose');

// 🎭 Dohvatanje dostupnih sedišta za određeni termin
router.get("/:showtimeId/:movieId/:cinemaId/seats", async (req, res) => {
  try {

    const { showtimeId, movieId, cinemaId } = req.params;
    console.log("🎭 Showtime ID:", showtimeId);
    console.log("🎬 Movie ID:", movieId);
    console.log("🏛 Cinema ID:", cinemaId);

    console.log(mongoose.Types.ObjectId.isValid(movieId));
    console.log(mongoose.Types.ObjectId.isValid(cinemaId));

    // ✅ Fetch showtime by matching all parameters
    const showtime = await Showtime.findOne({
      "datetime": showtimeId,
      "movie": { _id: new mongoose.Types.ObjectId(movieId) },
      // "cinema": { _id: new mongoose.Types.ObjectId(cinemaId) }
    }).lean();

    if (!showtime) {
      console.error("❌ Termin nije pronađen u bazi!");
      return res.status(404).json({ message: "Termin nije pronađen!" });
    }

    console.log("✅ Termin pronađen:", showtime);

    res.json({
      availableSeats: getAvailableSeats(showtime),
      bookedSeats: showtime.bookedSeats,
    });
  } catch (error) {
    console.error("❌ Greška pri dohvatanju sedišta:", error);
    res
      .status(500)
      .json({ message: "Greška na serveru!", error: error.message });
  }
});

// ✅ Funkcija za određivanje slobodnih sedišta
function getAvailableSeats(showtime) {
  const totalSeats = Array.from({ length: 48 }, (_, i) => i + 1);
  return totalSeats.filter((seat) => !showtime.bookedSeats.includes(seat));
}

module.exports = router;
