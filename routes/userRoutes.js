const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware"); // ✅ Ispravan import
const {
  getUser,
  updateUser,
  changePassword,
  deleteUser,
  getFavouriteMovies,
  addFavouriteMovie,
  removeFavouriteMovie,
} = require("../controllers/userController");

const router = express.Router();

// 🛠 Debug logovi
console.log("🔄 Provera authMiddleware tipa:", typeof authMiddleware);
console.log("🔄 Provera getUser funkcije:", typeof getUser);

if (typeof getUser !== "function") {
  console.error(
    "❌ Greška: getUser nije validna funkcija! Proveri userController.js."
  );
  process.exit(1);
}

// 📌 Definisanje ruta
router.get("/me", authMiddleware, getUser);
router.put("/update", authMiddleware, updateUser);
router.put("/change-password", authMiddleware, changePassword);
router.delete("/delete", authMiddleware, deleteUser);
router.get("/favourites", authMiddleware, getFavouriteMovies);
router.post("/favourites", authMiddleware, addFavouriteMovie);
router.delete("/favourites/:movieId", authMiddleware, removeFavouriteMovie);

module.exports = router;
