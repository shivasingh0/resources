const express = require("express");
const v1Routes = require("./v1/v1Routes");
const v2Routes = require("./v2/v2Routes");
const v3Routes = require("./v3/v3Route");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", (req, res) => res.send("Api route is Working"));
router.use("/v1", v1Routes);
router.use("/v2", authMiddleware, v2Routes);
router.use("/v3", isAdmin, v3Routes);

module.exports = router;
