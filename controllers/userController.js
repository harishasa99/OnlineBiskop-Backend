const bcrypt = require("bcrypt");
const User = require("../models/User");

// 📌 Dohvatanje korisnika
const getUser = async (req, res) => {
  try {
    console.log("🔍 getUser funkcija pozvana sa ID:", req.user?.id);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Niste autorizovani." });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      console.log("❌ Korisnik nije pronađen!");
      return res.status(404).json({ message: "Korisnik nije pronađen" });
    }

    return res.json(user);
  } catch (error) {
    console.error("❌ Greška pri učitavanju korisnika:", error);
    return res.status(500).json({ message: "Greška pri učitavanju korisnika" });
  }
};

// 📌 Ažuriranje korisničkih podataka
const updateUser = async (req, res) => {
  try {
    console.log("📥 Podaci za ažuriranje:", req.body);

    const { firstName, lastName, dateOfBirth, gender, favoriteCinema } =
      req.body;

    if (!firstName || !lastName || !dateOfBirth || !gender || !favoriteCinema) {
      return res.status(400).json({ message: "Sva polja su obavezna!" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Korisnik nije pronađen." });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.dateOfBirth = dateOfBirth;
    user.gender = gender;
    user.favoriteCinema = favoriteCinema;

    await user.save();
    console.log("✅ Korisnik uspešno ažuriran:", user);

    return res.json(user);
  } catch (error) {
    console.error("❌ Greška pri ažuriranju korisnika:", error);
    return res.status(500).json({ message: "Greška pri ažuriranju podataka" });
  }
};

// 📌 Promena lozinke
const changePassword = async (req, res) => {
  try {
    console.log("🔐 Zahtev za promenu lozinke korisnika ID:", req.user.id);

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Unesite staru i novu lozinku!" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Korisnik nije pronađen!" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Stara lozinka nije tačna!" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    console.log("✅ Lozinka uspešno promenjena!");

    return res.json({ message: "Lozinka uspešno promenjena!" });
  } catch (error) {
    console.error("❌ Greška pri promeni lozinke:", error);
    return res.status(500).json({ message: "Greška pri promeni lozinke!" });
  }
};

// 📌 Brisanje naloga
const deleteUser = async (req, res) => {
  try {
    console.log("🗑 Brisanje naloga korisnika ID:", req.user.id);

    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Korisnik nije pronađen!" });
    }

    console.log("✅ Nalog obrisan:", user.email);
    return res.json({ message: "Nalog uspešno obrisan" });
  } catch (error) {
    console.error("❌ Greška pri brisanju naloga:", error);
    return res.status(500).json({ message: "Greška pri brisanju naloga" });
  }
};

// ✅ Pravilno eksportovanje funkcija
module.exports = {
  getUser,
  updateUser,
  changePassword,
  deleteUser,
};
