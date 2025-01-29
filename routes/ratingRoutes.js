const express = require("express");
const Rating = require("../models/Rating");
const Movie = require("../models/Movie");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// ⭐ Ocenjivanje filma
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { movieId, rating } = req.body;
    const newRating = new Rating({
      user: req.user._id,
      movie: movieId,
      rating,
    });
    await newRating.save();

    // Ažuriraj prosečnu ocenu filma
    const ratings = await Rating.find({ movie: movieId });
    const avgRating =
      ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await Movie.findByIdAndUpdate(movieId, {
      rating: avgRating,
      votes: ratings.length,
    });

    res.status(201).json({ message: "Ocena sačuvana!", avgRating });
  } catch (error) {
    res.status(500).json({ message: "Greška pri ocenjivanju" });
  }
});

module.exports = router;
