const express = require("express");
const validateToken = require("../middleware/validateTokenHandler");
const { loginUser, currentUser } = require('../controllers/userControler');

const router = express.Router();

router.post("/login", loginUser);

router.get("/current", validateToken, currentUser);

module.exports = router