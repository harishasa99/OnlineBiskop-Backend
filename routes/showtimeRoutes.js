const express = require("express");
const Showtime = require("../models/Showtime");

const router = express.Router();

// 🎭 Dohvatanje dostupnih sedišta za određeni termin
router.get("/:showtimeId/seats", async (req, res) => {
  try {
    const { showtimeId } = req.params;
    console.log("🔍 Primljen showtimeId:", showtimeId);

    // Ako je `showtimeId` ObjectId, traži po `_id`
    if (showtimeId.match(/^[0-9a-fA-F]{24}$/)) {
      const showtime = await Showtime.findById(showtimeId);
      if (!showtime)
        return res.status(404).json({ message: "Termin nije pronađen!" });

      return res.json({
        availableSeats: getAvailableSeats(showtime),
        bookedSeats: showtime.bookedSeats,
      });
    }

    // Ako je `showtimeId` datum (konvertujemo u UTC)
    const parsedDatetime = new Date(decodeURIComponent(showtimeId));
    if (isNaN(parsedDatetime.getTime())) {
      console.error("❌ Nevalidan format datuma:", showtimeId);
      return res.status(400).json({ message: "Nevalidan format datuma!" });
    }

    // Pravimo vremenski opseg od ±1 minut za preciznu pretragu
    const startTime = new Date(parsedDatetime);
    const endTime = new Date(parsedDatetime);
    endTime.setMinutes(parsedDatetime.getMinutes() + 1);

    console.log("🔍 Tražim termin u bazi između:", startTime, "i", endTime);

    const showtime = await Showtime.findOne({
      datetime: { $gte: startTime, $lt: endTime },
    });

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

function getAvailableSeats(showtime) {
  const totalSeats = Array.from({ length: 48 }, (_, i) => i + 1);
  return totalSeats.filter((seat) => !showtime.bookedSeats.includes(seat));
}

module.exports = router;
