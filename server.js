const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db"); // Učitavamo funkciju za povezivanje sa bazom

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const movieRoutes = require("./routes/movieRoutes");
const cinemaRoutes = require("./routes/cinemaRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

// 📌 Učitavanje konfiguracije iz .env fajla
dotenv.config();

// 📌 Povezivanje sa bazom podataka
connectDB();

// 📌 Inicijalizacija Express servera
const app = express();

// 📌 Middleware
app.use(express.json()); // Omogućava Express-u da parsira JSON request body
app.use(cors()); // Omogućava frontend-u da pristupi backend-u sa drugog domena

// 🔄 Provera učitanih ruta
console.log("✅ Učitane rute:", { authRoutes, userRoutes });

// 📌 API Rute
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/cinemas", cinemaRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/uploads", express.static("uploads"));

// 📌 Startovanje servera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server pokrenut na portu ${PORT}`));
