const express = require("express");
const multer = require("multer");
const Movie = require("../models/Movie");
const Cinema = require("../models/Cinema");

const {
  authMiddleware,
  protectAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// 📂 Podešavanje multer-a za upload slika
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

/**
 * ✅ Dohvatanje filmova sa opcijama:
 * - Filtriranje po kategoriji (/api/movies?category=U bioskopu)
 * - Pretraga po naslovu (/api/movies?search=Batman)
 * - Paginacija (/api/movies?page=1&limit=10)
 */
router.get("/", async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (category) {
      filter.categories = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } }, // ✅ Pretraga po naslovu
        { director: { $regex: search, $options: "i" } }, // ✅ Pretraga po režiseru
      ];
    }

    const movies = await Movie.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvatanju filmova" });
  }
});

router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    console.log("Tražena kategorija:", category);

    const movies = await Movie.find({ categories: { $in: [category] } });
    console.log("Pronađeni filmovi:", movies);

    res.json(movies);
  } catch (error) {
    console.error("Greška pri dohvatanju filmova:", error);
    res.status(500).json({ message: "Greška pri dohvatanju filmova" });
  }
});

/**
 * ✅ Dohvatanje jednog filma po ID-u
 */
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).lean();
    if (!movie) return res.status(404).json({ message: "Film nije pronađen" });

    console.log("📌 Film pronađen:", movie);

    // 🔍 Pronađi bioskope u kojima se prikazuje ovaj film
    const cinemas = await Cinema.find({ "movies.movieId": movie._id }).lean();

    console.log("📌 Pronađeni bioskopi:", cinemas);

    // 🎬 Formatiranje bioskopa sa terminima
    const formattedCinemas = cinemas.map((cinema) => {
      const movieData = cinema.movies.find(
        (m) => m.movieId.toString() === movie._id.toString()
      );

      return {
        _id: cinema._id,
        name: cinema.name,
        location: cinema.location,
        showtimes: movieData ? movieData.showtimes : [], // ✅ Ovo osigurava da uzmemo termine
      };
    });

    console.log("📌 Formatirani bioskopi sa terminima:", formattedCinemas);

    res.json({ ...movie, cinemas: formattedCinemas });
  } catch (error) {
    console.error("❌ Greška pri učitavanju filma:", error);
    res.status(500).json({ message: "Greška pri učitavanju filma" });
  }
});

/**
 * ✅ Dodavanje novog filma
 */
router.post(
  "/",
  authMiddleware,
  protectAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        genre,
        director,
        duration,
        releaseDate,
        price,
        categories,
      } = req.body;
      if (!req.file)
        return res.status(400).json({ message: "Slika je obavezna" });

      const newMovie = new Movie({
        title,
        description,
        genre,
        director,
        duration,
        releaseDate,
        price,
        image: `/uploads/${req.file.filename}`,
        categories: categories ? categories.split(",") : [],
      });

      await newMovie.save();
      res.status(201).json({ message: "Film uspešno dodat!", movie: newMovie });
    } catch (error) {
      res.status(500).json({ message: "Greška pri dodavanju filma" });
    }
  }
);

/**
 * ✅ Dodavanje filma u bioskop
 */
router.put(
  "/:id/addToCinema",
  authMiddleware,
  protectAdmin,
  async (req, res) => {
    try {
      const { cinemaId, showtimes } = req.body;

      if (!cinemaId || !showtimes || !Array.isArray(showtimes)) {
        return res
          .status(400)
          .json({ message: "Neispravni podaci za bioskop" });
      }

      const movie = await Movie.findById(req.params.id);
      if (!movie)
        return res.status(404).json({ message: "Film nije pronađen" });

      movie.cinemas = movie.cinemas || [];
      movie.cinemas.push({ cinemaId, showtimes });

      await movie.save();
      res.json({ message: "Film dodat u bioskop!", movie });
    } catch (error) {
      res.status(500).json({ message: "Greška pri dodavanju filma u bioskop" });
    }
  }
);

/**
 * ✅ Ažuriranje filma
 */
router.put(
  "/:id",
  authMiddleware,
  protectAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        genre,
        director,
        duration,
        releaseDate,
        price,
        categories,
      } = req.body;
      const movie = await Movie.findById(req.params.id);
      if (!movie)
        return res.status(404).json({ message: "Film nije pronađen" });

      if (req.file) {
        movie.image = `/uploads/${req.file.filename}`;
      }

      movie.title = title;
      movie.description = description;
      movie.genre = genre;
      movie.director = director;
      movie.duration = duration;
      movie.releaseDate = releaseDate;
      movie.price = price;
      movie.categories = categories ? categories.split(",") : [];

      await movie.save();
      res.json({ message: "Film uspešno ažuriran", movie });
    } catch (error) {
      res.status(500).json({ message: "Greška pri ažuriranju filma" });
    }
  }
);

/**
 * ✅ Brisanje filma
 */
router.delete("/:id", authMiddleware, protectAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "Film nije pronađen" });

    res.json({ message: "Film uspešno obrisan" });
  } catch (error) {
    res.status(500).json({ message: "Greška pri brisanju filma" });
  }
});

router.post("/:movieId/rate", authMiddleware, async (req, res) => {
  try {
    const { movieId } = req.params;
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Ocena mora biti između 1 i 5" });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Film nije pronađen!" });
    }

    movie.votes += 1;
    movie.rating = (movie.rating * (movie.votes - 1) + rating) / movie.votes;
    await movie.save();

    res.json({ message: "Ocena sačuvana!", newRating: movie.rating });
  } catch (error) {
    console.error("Greška pri ocenjivanju filma:", error);
    res.status(500).json({ message: "Greška na serveru!" });
  }
});

module.exports = router;
