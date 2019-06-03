var express = require("express");
var router = express.Router();
var User = require("../models/user");
var { ObjectID } = require("mongodb");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const crypto = require("crypto");
var fs = require("fs");
var bodyParser = require("body-parser");

router.get("/", function(req, res) {
  res.render("editable");
});

router.post("/", function(req, res) {
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
var idd1;
var imgg;
router.post("/edit1", function(req, res) {
  console.log(req.query);
  idd1 = req.query.id;
  User.findById(idd1, function(err, ress) {
    if (err) throw err;
    else {
      imgg = ress.img;
      console.log(imgg);
    }
  });
});

router.post("/edit", upload.single("upload"), async function(req, res) {
  console.log(req.body);

  if (!req.file) {
    var arr = Object.keys(req.body);
    var arr1 = arr[1].split("[");
    var id = arr1[1].substring(0, arr1[1].length - 1);
    var idd = new ObjectID(id);
    var data2update = arr1[2].substring(0, arr1[2].length - 1);
    var xyz = data2update.toString();
    var newdata = req.body[arr[1]];
    var update1 = {};
    update1[xyz] = newdata;
    User.findOneAndUpdate({ _id: idd }, { $set: update1 }).then(
      result => {
        console.log(result);
        res.send(result);
      },
      e => {
        console.log(e);
      }
    );
  } else {
    console.log(req.file);
    // gfs.remove({ filename: imgg, root: "users" }, (err, gridStore) => {
    //   if (err) {
    //     return res.status(404).json({ err: err });
    //   } else {
    //     console.log("image deleted");
    //   }
    // });
    var img = req.file.filename;
    console.log(img);
    User.findOneAndUpdate(
      { _id: idd1 },
      {
        $set: {
          img: img
        }
      }
    ).exec(function(err, result) {
      if (err) throw err;
      else {
        result.img = img;
        console.log(result);
        res.send(result);
      }
    });
  }
});

module.exports = router;
