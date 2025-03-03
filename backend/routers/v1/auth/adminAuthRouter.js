const { registerAdmin, loginAdmin } = require("../../../controllers/auth/adminAuthController")

const router = require("express").Router()

router.post("/register",registerAdmin)
router.post("/login",loginAdmin)

module.exports = router 