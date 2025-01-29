const express = require("express");
const {
  getUsers,
  deleteUser,
  updateUserRole,
} = require("../controllers/adminController");
const {
  authMiddleware,
  protectAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/users", authMiddleware, protectAdmin, getUsers);
router.delete("/users/:id", authMiddleware, protectAdmin, deleteUser);
router.put("/users/:id/role", authMiddleware, protectAdmin, updateUserRole);

module.exports = router;
