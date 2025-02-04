const express = require("express");
const Showtime = require("../models/Showtime");

const router = express.Router();

// 🎭 Dohvatanje dostupnih sedišta za određeni termin
router.get("/:showtimeId/seats", async (req, res) => {
  try {
    const { showtimeId } = req.params;
    console.log("🔍 Primljen showtimeId:", showtimeId);

    // ✅ Proveravamo da li je validan MongoDB ObjectId
    if (!showtimeId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error("❌ Neispravan format ID-a:", showtimeId);
      return res.status(400).json({ message: "Neispravan ID formata!" });
    }

    // ✅ Tražimo showtime direktno po `_id`
    const showtime = await Showtime.findById(showtimeId);
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
