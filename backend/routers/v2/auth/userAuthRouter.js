const express = require("express");
const {
  updateUser,
  deleteUser,
  logout,
  userProfile,
} = require("../../../controllers/auth/userAuthController");
const router = express.Router();

router.patch("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);
router.get("/logout", logout);
router.get("/me", userProfile);

module.exports = router;
