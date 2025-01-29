const express = require("express");
const {
  register,
  login,
  verifyEmail,
} = require("../controllers/authController");

const router = express.Router();

// Rute za autentifikaciju
router.post("/register", register);
router.post("/login", login);
router.get("/verify/:token", verifyEmail); // Verifikacija e-maila

router.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(403).json({ message: "Nema refresh tokena!" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Nevažeći refresh token!" });
  }
});

module.exports = router;
