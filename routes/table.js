var express = require("express");
var router = express.Router();
var User = require("../models/user");
var { ObjectID } = require("mongodb");
var { ensureAuthenticated } = require("./../config/auth");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const crypto = require("crypto");
// datatable

router.get("/", ensureAuthenticated, function(req, res) {
  res.render("table");
});

router.post("/", ensureAuthenticated, function(req, res) {
  console.log(req.body["search[value]"]);
  var searchStr = req.body["search[value]"];
  if (req.body["search[value]"]) {
    var regex = new RegExp(req.body["search[value]"], "i");
    searchStr = {
      $or: [{ username: regex }, { email: regex }, { contact: regex }]
    };
  } else {
    searchStr = {};
  }

  var recordsTotal = 0;
  var recordsFiltered = 0;

  User.count({}, function(err, c) {
    recordsTotal = c;
    console.log(c);
    User.count(searchStr, function(err, c) {
      recordsFiltered = c;
      console.log(c);
      console.log(req.body.start);
      console.log(req.body.length);
      User.find(
        searchStr,
        "username email contact img",
        { skip: Number(req.body.start), limit: Number(req.body.length) },
        function(err, results) {
          if (err) {
            console.log("error while getting results" + err);
            return;
          }

          var data = JSON.stringify({
            draw: req.body.draw,
            recordsFiltered: recordsFiltered,
            recordsTotal: recordsTotal,
            data: results
          });
          res.send(data);
        }
      );
    });
  });
});

//update at table
router.post("/xyz", upload.single("file"), function(req, res) {
  if (req.file) {
    gfs.remove(
      { filename: req.body.imgid, root: "users" },
      (err, gridStore) => {
        if (err) {
          return res.status(404).json({ err: err });
        } else {
          console.log("image deleted");
        }
      }
    );
    var img = req.file.filename;
    console.log(img);
    {
      User.findOneAndUpdate(
        { _id: req.body.idd },
        {
          $set: {
            username: req.body.username,
            age: req.body.age,
            email: req.body.email,
            contact: req.body.contact,
            company: req.body.company,
            address: req.body.address,
            img: img
          }
        }
      ).exec(function(err, result) {
        if (err) throw err;
        else {
          result.img = img;
          res.send(result);
        }
      });
    }
  } else {
    var img = req.body.img;
    {
      User.findOneAndUpdate(
        { _id: req.body.idd },
        {
          $set: {
            username: req.body.username,
            age: req.body.age,
            email: req.body.email,
            contact: req.body.contact,
            company: req.body.company,
            address: req.body.address
          }
        }
      ).exec(function(err, result) {
        if (err) throw err;
        else {
          res.send(result);
        }
      });
    }
  }
  // let errors = [];

  // if (!username || !email || !address || !company || !age || !contact) {
  //   errors.push({ msg: "Please enter all fields" });
  // }
  // var ere = new RegExp(
  //   "(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])"
  // );

  // if (!ere.test(email)) {
  //   errors.push({ msg: "E-mail Format is not correct" });
  // }

  // if (errors.length > 0) {
  //   res.render("table", { errors: errors });
  // } else
});

module.exports = router;
