const express = require("express");
const router = express.Router();
const controller = require("../controllers/dataController");

const EVENT_API_KEY = process.env.OCCUPANCY_EVENT_API_KEY ?? "lablens-secret";

const requireEventApiKey = (req, res, next) => {
  const apiKey = req.header("x-api-key");

  if (!apiKey || apiKey !== EVENT_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
};

router.post("/event", requireEventApiKey, controller.receiveData);
router.post("/mock", controller.receiveMockData);
router.post("/", controller.receiveData);
router.get("/", controller.getData);
router.get("/current", controller.getCurrentData);

module.exports = router;
