const express = require("express");
const Cinema = require("../models/Cinema");
const Movie = require("../models/Movie");
const {
  authMiddleware,
  protectAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Dohvati sve bioskope
router.get("/", async (req, res) => {
  try {
    const cinemas = await Cinema.find().populate("movies.movieId");
    res.json(cinemas);
  } catch (error) {
    console.error("Greška pri dohvatanju bioskopa:", error);
    res.status(500).json({ message: "Greška pri dohvatanju bioskopa" });
  }
});

// ✅ Dodaj novi bioskop (sa proverom duplikata)
router.post("/", authMiddleware, protectAdmin, async (req, res) => {
  try {
    const { name, location } = req.body;

    // Proveri da li bioskop sa istim nazivom već postoji
    const existingCinema = await Cinema.findOne({ name });
    if (existingCinema) {
      return res
        .status(400)
        .json({ message: "Bioskop sa ovim imenom već postoji" });
    }

    const newCinema = new Cinema({ name, location, movies: [] });
    await newCinema.save();

    res.status(201).json({ message: "Bioskop dodat!", cinema: newCinema });
  } catch (error) {
    console.error("Greška pri dodavanju bioskopa:", error);
    res.status(500).json({ message: "Greška pri dodavanju bioskopa" });
  }
});

// ✅ Dodaj film u bioskop sa terminima
router.put(
  "/:cinemaId/addMovie",
  authMiddleware,
  protectAdmin,
  async (req, res) => {
    try {
      const { movieId, showtimes } = req.body;

      // ✅ Proveri da li film postoji u bazi
      const movie = await Movie.findById(movieId);
      if (!movie) {
        return res.status(404).json({ message: "Film nije pronađen u bazi!" });
      }

      const cinema = await Cinema.findById(req.params.cinemaId);
      if (!cinema) {
        return res.status(404).json({ message: "Bioskop nije pronađen" });
      }

      // ✅ Proveri da li film već postoji u bioskopu
      const existingMovie = cinema.movies.find(
        (m) => m.movieId.toString() === movieId
      );
      if (existingMovie) {
        return res
          .status(400)
          .json({ message: "Film je već dodat u ovaj bioskop" });
      }

      // ✅ Dodaj film u bioskop
      cinema.movies.push({ movieId, showtimes, seats: [] });
      await cinema.save();

      // ✅ Ažuriraj `Movie` kolekciju da sadrži referencu na bioskop
      if (!movie.cinemas.includes(cinema._id)) {
        movie.cinemas.push(cinema._id);
        await movie.save(); // Sačuvaj ažurirani film
      }

      res.json({ message: "Film dodat u bioskop i ažuriran!", cinema, movie });
    } catch (error) {
      console.error("Greška pri dodavanju filma u bioskop:", error);
      res.status(500).json({ message: "Greška pri dodavanju filma u bioskop" });
    }
  }
);

router.delete("/:cinemaId", authMiddleware, protectAdmin, async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.cinemaId);

    if (!cinema) {
      return res.status(404).json({ message: "Bioskop nije pronađen" });
    }

    res.json({ message: "Bioskop uspešno obrisan" });
  } catch (error) {
    console.error("Greška pri brisanju bioskopa:", error);
    res.status(500).json({ message: "Greška pri brisanju bioskopa" });
  }
});

module.exports = router;
