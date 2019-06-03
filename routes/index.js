var express = require("express");
var router = express.Router();
var user = require("../models/user");
var { ensureAuthenticated } = require("./../config/auth");

var app = express();
// Get home page
router.get("/", ensureAuthenticated, function(req, res) {
  res.render("index", { user: user });
});

// Get home page
// router.get("/table", function(req, res) {
//   user.find({}, function(err, docs) {
//     if (err) res.send(err);
//     else {
//       res.render("table", { user: docs });
//     }
//   });
// });

router.get("/users/update", ensureAuthenticated, function(req, res) {
  res.render("update");
});

module.exports = router;
