const express = require("express");
const userAuthRouter = require("../../routers/v2/auth/userAuthRouter");

const router = express.Router();

router.use("/user", userAuthRouter);

module.exports = router;
