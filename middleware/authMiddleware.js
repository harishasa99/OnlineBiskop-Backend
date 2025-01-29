const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Middleware za autentifikaciju korisnika
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Nema tokena, autorizacija odbijena!" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Nevažeći token." });
    }

    req.user = user; // 🔹 Postavljamo korisnika u request
    next();
  } catch (error) {
    console.error("❌ Greška pri autentifikaciji:", error.message);
    res.status(401).json({ message: "Neispravan token." });
  }
};

const protectAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Zabranjen pristup" });
  }
  next();
};

module.exports = { authMiddleware, protectAdmin };
