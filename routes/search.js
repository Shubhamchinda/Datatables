var express = require("express");
var router = express.Router();
var User = require("../models/user");

router.get("/", function(req, res) {
  res.render("search");
});

router.get("/xhr", (req, res) => {
  console.log(req.query);
  let q = req.query.q;
  console.log(q);
  User.find(
    {
      username: {
        $regex: new RegExp(q)
      }
    },
    {
      _id: 0,
      __v: 0
    },
    function(err, data) {
      res.json(data);
    }
  ).limit(10);
});
router.post("/", function(req, res) {
  var id = req.query.email;
  User.find({ email: id }, function(err, ress) {
    if (err) throw err;
    else {
      console.log(ress);
      res.send(ress[0]);
    }
  });
});

module.exports = router;
