const express = require("express");
const Showtime = require("../models/Showtime");

const router = express.Router();

// 🎭 Dohvatanje dostupnih sedišta za određeni termin
router.get("/:showtimeId/seats", async (req, res) => {
  try {
    const { showtimeId } = req.params;
    const decodedShowtimeId = decodeURIComponent(showtimeId);

    console.log("🔍 Primljen showtimeId:", showtimeId);
    console.log("🕒 Dekodirani datum:", decodedShowtimeId);

    // ✅ Konvertuj datum u UTC
    const parsedDatetime = new Date(decodedShowtimeId + " UTC");
    console.log("📅 Parsed datetime (UTC):", parsedDatetime);

    if (isNaN(parsedDatetime.getTime())) {
      console.error("❌ Nevalidan format datuma:", decodedShowtimeId);
      return res.status(400).json({ message: "Nevalidan format datuma!" });
    }

    // ✅ Postavi pretragu u MongoDB sa vremenskim opsegom (1 minut tolerancije)
    const nextMinute = new Date(parsedDatetime);
    nextMinute.setMinutes(parsedDatetime.getMinutes() + 1);

    console.log(
      "🔍 Tražim termin u bazi od:",
      parsedDatetime,
      "do:",
      nextMinute
    );
    const showtime = await Showtime.findOne({
      datetime: { $gte: parsedDatetime, $lt: nextMinute },
    });

    if (!showtime) {
      console.error("❌ Termin nije pronađen u bazi!");
      return res.status(404).json({ message: "Termin nije pronađen!" });
    }

    console.log("✅ Termin pronađen:", showtime);

    const bookedSeats = showtime.bookedSeats || [];
    const totalSeats = Array.from({ length: 48 }, (_, i) => i + 1);
    const availableSeats = totalSeats.filter(
      (seat) => !bookedSeats.includes(seat)
    );

    res.json({ availableSeats, bookedSeats });
  } catch (error) {
    console.error("❌ Greška pri dohvatanju sedišta:", error);
    res
      .status(500)
      .json({ message: "Greška na serveru!", error: error.message });
  }
});

module.exports = router;
