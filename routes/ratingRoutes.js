const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const Movie = require("../models/Movie");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { movieId, rating } = req.body;
    const userId = req.user._id; // Dobijamo user ID iz tokena

    if (!movieId || !rating) {
      return res.status(400).json({ message: "Nedostaju podaci za ocenu!" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Ocena mora biti između 1 i 5!" });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Film nije pronađen!" });
    }

    // Prosečna ocena = (trenutna_ocena * broj_glasova + nova_ocena) / (broj_glasova + 1)
    movie.votes += 1;
    movie.rating = (movie.rating * (movie.votes - 1) + rating) / movie.votes;

    await movie.save();

    res.json({ message: "Ocena sačuvana!", newRating: movie.rating });
  } catch (error) {
    console.error("❌ Greška pri ocenjivanju filma:", error);
    res.status(500).json({ message: "Greška na serveru!" });
  }
});

module.exports = router;
