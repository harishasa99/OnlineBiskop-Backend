const express = require("express");
const Showtime = require("../models/Showtime");

const router = express.Router();

// 🎭 Dohvatanje dostupnih sedišta za određeni termin
router.get("/:datetime/:movie/:cinema/seats", async (req, res) => {
  try {

    const { datetime, movie, cinema } = req.params;
    console.log("🎭 Showtime ID / datetime:", datetime);
    console.log("🎬 Movie ID:", movie);
    console.log("🏛 Cinema ID:", cinema);

    // ✅ Fetch showtime by matching all parameters
    const showtime = await Showtime.findOne({
      datetime,
      movie,
      cinema
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
