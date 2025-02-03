const express = require("express");
const Ticket = require("../models/Ticket");
const Showtime = require("../models/Showtime");
const Cinema = require("../models/Cinema");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// 🎟️ Kupovina karata
const purchaseTicket = async (req, res) => {
  try {
    const { userId, movieId, cinemaId, showtime, seats } = req.body;

    if (!userId || !movieId || !cinemaId || !showtime || !seats.length) {
      return res.status(400).json({ message: "Nedostaju podaci za kupovinu." });
    }

    console.log("📌 Podaci primljeni za kupovinu:", req.body);

    let existingShowtime = await Showtime.findOne({
      cinema: cinemaId,
      datetime: new Date(showtime),
    });

    if (!existingShowtime) {
      console.log("⚠️ Showtime nije pronađen, kreiram novi...");
      existingShowtime = await Showtime.create({
        movie: movieId,
        cinema: cinemaId,
        datetime: new Date(showtime),
        bookedSeats: [],
      });

      await Cinema.findByIdAndUpdate(cinemaId, {
        $push: { showtimes: existingShowtime._id },
      });

      console.log("✅ Novi showtime kreiran:", existingShowtime._id);
    }

    existingShowtime.bookedSeats.push(...seats);
    await existingShowtime.save();

    const ticket = new Ticket({
      userId,
      movieId,
      cinemaId,
      showtime: existingShowtime._id,
      seats,
    });

    await ticket.save();

    console.log("🎟️ Karta uspešno kupljena:", ticket);
    res.status(201).json({ message: "Uspešno ste kupili kartu!" });
  } catch (error) {
    console.error("❌ Greška pri kupovini karata:", error);
    res.status(500).json({ message: "Došlo je do greške pri kupovini." });
  }
};

router.post("/purchase", purchaseTicket);

router.get("/my-tickets", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const tickets = await Ticket.find({ userId })
      .populate("movieId", "title image")
      .populate("cinemaId", "name location");

    res.json(
      tickets.map((ticket) => ({
        _id: ticket._id,
        movie: ticket.movieId,
        cinema: ticket.cinemaId,
        seats: ticket.seats,
      }))
    );
  } catch (error) {
    console.error("❌ Greška pri dohvatanju ulaznica:", error);
    res
      .status(500)
      .json({ message: "Došlo je do greške pri dohvatanju ulaznica." });
  }
});

module.exports = router;
