const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/emailService"); // ✅ Ispravan email servis
const nodemailer = require("nodemailer"); // ✅ Mora biti importovan ako koristiš transporter
require("dotenv").config();

// Registracija korisnika
exports.register = async (req, res) => {
  try {
    console.log("📥 Backend primio podatke:", req.body);

    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      favoriteCinema,
      email,
      password,
      confirmPassword,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !gender ||
      !favoriteCinema ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res
        .status(400)
        .json({ message: "Molimo popunite sva obavezna polja!" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Lozinke se ne poklapaju!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "E-mail adresa je već registrovana." });
    }

    console.log("🔒 Hesham lozinku...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("🔑 Generišem verifikacioni token...");
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    console.log("📡 Kreiram novog korisnika u bazi...");
    const newUser = new User({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      favoriteCinema,
      email,
      password: hashedPassword,
      role: "user",
      verificationToken,
    });

    await newUser.save();
    console.log("✅ Korisnik uspešno sačuvan u bazi!");

    console.log("📧 Šaljem verifikacioni e-mail...");
    await sendEmail(
      email,
      "Verifikacija naloga",
      `Kliknite na link za verifikaciju: http://localhost:5000/api/auth/verify/${verificationToken}`
    );

    res.status(201).json({
      message:
        "Korisnik uspešno registrovan! Proverite e-mail za verifikaciju.",
    });
  } catch (error) {
    console.error("❌ Greška pri registraciji:", error);
    res.status(500).json({ message: "Došlo je do greške. Pokušajte ponovo." });
  }
};

// Prijava korisnika
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ message: "Neispravna e-mail adresa ili lozinka." });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Morate verifikovati svoj e-mail pre prijave." });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET
    ); // 🟢 Token sada **ne ističe**

    res.json({ accessToken, user, message: "Prijava uspešna!" });
  } catch (error) {
    res.status(500).json({ message: "Došlo je do greške. Pokušajte ponovo." });
  }
};

// Verifikacija e-maila
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Neispravan verifikacioni link." });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: "E-mail uspešno verifikovan!" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Neispravan ili istekao verifikacioni token." });
  }
};
