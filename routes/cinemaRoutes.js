const express = require("express");
const Cinema = require("../models/Cinema");
const Movie = require("../models/Movie");
const {
  authMiddleware,
  protectAdmin,
} = require("../middleware/authMiddleware");
module.exports = Movie;
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

      if (!movieId || !showtimes || !Array.isArray(showtimes)) {
        return res
          .status(400)
          .json({ message: "Neispravni podaci za bioskop" });
      }

      const movie = await Movie.findById(movieId);
      if (!movie) {
        return res.status(404).json({ message: "Film nije pronađen u bazi!" });
      }

      const cinema = await Cinema.findById(req.params.cinemaId);
      if (!cinema) {
        return res.status(404).json({ message: "Bioskop nije pronađen" });
      }

      cinema.movies.push({ movieId, showtimes, seats: [] });
      await cinema.save();

      movie.cinemas.push({ cinemaId: cinema._id, showtimes });
      await movie.save();

      res.json({
        message: "Film dodat u bioskop sa terminima!",
        cinema,
        movie,
      });
    } catch (error) {
      console.error("Greška pri dodavanju filma u bioskop:", error);
      res.status(500).json({ message: "Greška pri dodavanju filma u bioskop" });
    }
  }
);

module.exports = router;

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

router.get("/:cinemaId/movies/:showtime", async (req, res) => {
  const { cinemaId, showtime } = req.params;
  console.log("📌 Backend primio:", { cinemaId, showtime });

  try {
    const cinema = await Cinema.findById(cinemaId).populate("movies.movieId");
    if (!cinema) {
      console.error("❌ Bioskop nije pronađen!");
      return res.status(404).json({ message: "Bioskop nije pronađen!" });
    }

    const movieEntry = cinema.movies.find((m) =>
      m.showtimes.includes(showtime)
    );

    if (!movieEntry) {
      console.error("❌ Film nije pronađen u ovom bioskopu!");
      return res
        .status(404)
        .json({ message: "Film nije pronađen u ovom bioskopu!" });
    }

    const movie = await Movie.findById(movieEntry.movieId); // Učitaj ceo film

    // Moras da uzmes i showtime id

    console.log("📌 API vraća film:", movie); // ✅ Provera da li postoji `image`

    res.json({ movie, cinema });
  } catch (error) {
    console.error("❌ Greška pri dohvatanju filma u bioskopu:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
});

module.exports = router;
