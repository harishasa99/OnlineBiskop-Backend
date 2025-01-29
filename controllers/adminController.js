const User = require("../models/User");

// ✅ Dohvatanje svih korisnika
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    console.error("Greška pri dohvatanju korisnika:", error);
    res.status(500).json({ message: "Greška pri učitavanju korisnika" });
  }
};

// ✅ Brisanje korisnika
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Korisnik nije pronađen." });

    res.json({ message: "Korisnik uspešno obrisan" });
  } catch (error) {
    console.error("Greška pri brisanju korisnika:", error);
    res.status(500).json({ message: "Greška pri brisanju korisnika" });
  }
};

// ✅ Izmena korisničke role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Neispravna uloga." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Korisnik nije pronađen." });
    }

    user.role = role;
    await user.save();

    res.json({ message: "Uloga uspešno ažurirana." });
  } catch (error) {
    console.error("Greška pri ažuriranju uloge:", error);
    res.status(500).json({ message: "Greška pri izmeni uloge korisnika." });
  }
};

module.exports = { getUsers, deleteUser, updateUserRole };
