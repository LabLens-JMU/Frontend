const express = require("express");
const router = express.Router();
const controller = require("../controllers/dataController");

const API_KEY = process.env.OCCUPANCY_API_KEY || "lablens-secret";

const requireApiKey = (req, res, next) => {
  const incomingKey = req.header("x-api-key");
  if (incomingKey !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
};

router.get("/current", controller.getCurrent);
router.post("/event", requireApiKey, controller.receiveData);

// Legacy aliases for local compatibility.
router.post("/", requireApiKey, controller.receiveData);
router.get("/", controller.getData);

module.exports = router;
