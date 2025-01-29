const express = require("express");
const Ticket = require("../models/Ticket");
const Cinema = require("../models/Cinema");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Kupovina karte (sa validacijom zauzetosti sedišta)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { movieId, cinemaId, showtime, seats } = req.body;
    const userId = req.user._id;

    // Pronađi bioskop
    const cinema = await Cinema.findById(cinemaId);
    if (!cinema)
      return res.status(404).json({ message: "Bioskop nije pronađen" });

    // Pronađi film u bioskopu
    const movieInCinema = cinema.movies.find(
      (m) => m.movieId.toString() === movieId
    );
    if (!movieInCinema)
      return res.status(404).json({ message: "Film nije u ovom bioskopu" });

    // Provera da li su sedišta već zauzeta
    const alreadyReservedSeats = seats.filter((seat) =>
      movieInCinema.seats.some(
        (s) => s.row === seat.row && s.number === seat.number && s.isReserved
      )
    );

    if (alreadyReservedSeats.length > 0) {
      return res.status(400).json({
        message: "Neka od izabranih sedišta su već zauzeta!",
        takenSeats: alreadyReservedSeats,
      });
    }

    // Označi sedišta kao zauzeta
    seats.forEach((seat) => {
      movieInCinema.seats.push({ ...seat, isReserved: true });
    });

    await cinema.save();

    // Kreiraj kartu
    const newTicket = new Ticket({
      userId,
      movieId,
      cinemaId,
      showtime,
      seats,
    });
    await newTicket.save();

    res.status(201).json({ message: "Karta kupljena!", ticket: newTicket });
  } catch (error) {
    console.error("Greška pri kupovini karte:", error);
    res.status(500).json({ message: "Greška pri kupovini karte" });
  }
});

// ✅ Dohvati korisnikove karte (sortirane po datumu)
router.get("/my-tickets", authMiddleware, async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user._id })
      .populate("movieId cinemaId")
      .sort({ showtime: 1 });

    res.json(tickets);
  } catch (error) {
    console.error("Greška pri dohvatanju karata:", error);
    res.status(500).json({ message: "Greška pri dohvatanju karata" });
  }
});

module.exports = router;
