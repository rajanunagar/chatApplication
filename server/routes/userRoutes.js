const express = require("express");
const {
  registerUser,
  currentUser,
  loginUser,
logout,
  deleteUser
} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/validatetoken", validateToken, (req, res) => {
  res.status(200).json({ valid: true });
});
router.get("/current", validateToken, currentUser);
router.route('/').delete(validateToken, deleteUser);
router.patch("/logout", validateToken, logout);

module.exports = router;
