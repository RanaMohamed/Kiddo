const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Kid = require("../models/kid");
const Supporter = require("../models/supporter");
const Buyer = require("../models/buyer");

router.get("/:id", async (req, res) => {
  const user =
    (await Kid.findById({ _id: req.params.id })) ||
    (await Supporter.findById({ _id: req.params.id })) ||
    (await Buyer.findById({ _id: req.params.id }));
  res.status(200).send(user);
});

module.exports = router;
