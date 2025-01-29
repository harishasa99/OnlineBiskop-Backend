const Movie = require("../models/Movie");
const fs = require("fs");
const path = require("path");
const Cinema = require("../models/Cinema");

// ✅ Dohvatanje svih filmova
const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Greška pri učitavanju filmova" });
  }
};

// ✅ Dohvatanje jednog filma po ID-u
const getMovieById = async (req, res) => {
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
};

// ✅ Dodavanje novog filma
const addMovie = async (req, res) => {
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
      image: `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`,
      categories: Array.isArray(categories)
        ? categories
        : categories.split(","),
    });

    await newMovie.save();
    res.status(201).json({ message: "Film uspešno dodat!", movie: newMovie });
  } catch (error) {
    res.status(500).json({ message: "Greška pri dodavanju filma" });
  }
};

// ✅ Ažuriranje filma
const updateMovie = async (req, res) => {
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

    if (!movie) return res.status(404).json({ message: "Film nije pronađen" });

    if (req.file) {
      const imagePath = path.join(__dirname, "..", movie.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      movie.image = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
    }

    movie.title = title;
    movie.description = description;
    movie.genre = genre;
    movie.director = director;
    movie.duration = duration;
    movie.releaseDate = releaseDate;
    movie.price = price;
    movie.categories = Array.isArray(categories)
      ? categories
      : categories.split(",");

    await movie.save();
    res.json({ message: "Film uspešno ažuriran", movie });
  } catch (error) {
    res.status(500).json({ message: "Greška pri ažuriranju filma" });
  }
};

// ✅ Brisanje filma
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Film nije pronađen" });

    const imagePath = path.join(__dirname, "..", movie.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Movie.findByIdAndDelete(req.params.id);
    res.json({ message: "Film uspešno obrisan" });
  } catch (error) {
    res.status(500).json({ message: "Greška pri brisanju filma" });
  }
};

module.exports = {
  getMovies,
  getMovieById,
  addMovie,
  updateMovie,
  deleteMovie,
};
