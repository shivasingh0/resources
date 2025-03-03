const express = require("express");
const userAuthRouter = require("../../routers/v1/auth/userAuthRouter");
const adminRouter = require("../../routers/v1/auth/adminAuthRouter")

const router = express.Router();

router.use("/user", userAuthRouter);
router.use("/admin",adminRouter)

module.exports = router;