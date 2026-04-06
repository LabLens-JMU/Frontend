const express = require("express");
const router = express.Router();
const controller = require("../controllers/dataController");

router.post("/event", controller.receiveData);
router.post("/mock", controller.receiveMockData);
router.post("/", controller.receiveData);
router.get("/", controller.getData);

module.exports = router;
