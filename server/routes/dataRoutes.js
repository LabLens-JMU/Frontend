const express = require("express");
const router = express.Router();
const controller = require("../controllers/dataController");

router.post("/", controller.receiveData);
router.get("/", controller.getData);

module.exports = router;
