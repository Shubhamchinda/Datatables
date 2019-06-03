var express = require("express");
var router = express.Router();
var path = require("path");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var { ensureAuthenticated } = require("./../config/auth");
var User = require("./../models/user");
var { ObjectID } = require("mongodb");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const crypto = require("crypto");
var fs = require("fs");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var formidable = require("formidable");
// Getregisterpage
router.get("/register", function(req, res) {
  res.render("register");
});
// Get loginpage
router.get("/login", function(req, res) {
  res.render("login");
});

//init gfs

// let gfs;

// conn.once("open", () => {
//   gfs = Grid(conn.db, mongoose.mongo);
//   gfs.collection("users");
// });

// multer gridfs
const storage = new GridFsStorage({
  url: "mongodb://localhost:27017/imgg",
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "users"
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });
global.upload = upload;

// register user
router.post("/upload/", upload.single("file"), function(req, res) {
  console.log(req.file.id);
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;
  var contact = req.body.contact;

  // var upload_path = "/Pictures";
  var img = req.file.filename;
  // console.log(img);
  let errors = [];

  // var form = new formidable.IncomingForm();
  // form.parse(req, function(err, fields, files) {
  //   // oldpath : temporary folder to which file is saved to
  //   var oldpath = files.filetoupload.path;
  //   var newpath = upload_path + files.filetoupload.name;
  //   // copy the file to a new location
  //   fs.rename(oldpath, newpath, function(err) {
  //     if (err) throw err;
  //     // you may respond with another html page
  //   });
  // });

  if (!username || !email || !password || !password2 || !contact) {
    errors.push({ msg: "Please enter all fields" });
  }
  var ere = new RegExp(
    "(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])"
  );

  if (!ere.test(email)) {
    errors.push({ msg: "E-mail Format is not correct" });
  }

  var re = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*]).{8,32}"
  );

  if (!re.test(password)) {
    errors.push({ msg: "Password Format is not correct" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 8) {
    errors.push({ msg: "Password must be at least 8 characters" });
  }
  if (errors.length > 0) {
    res.render("register", { errors: errors });
  } else {
    var newUser = new User({
      username: username,
      email: email,
      password: password,
      contact: contact,
      img: img
    });

    User.createUser(newUser, function(err, user) {
      if (err) throw err;
    });

    gfs.files.findOne({ filename: req.file.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: "No file exists"
        });
      } else {
        res.contentType("image/png");

        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      }
    });
    // req.flash("success_msg", "You are registered and can now login");

    // res.redirect("/users/login");
  }
});
router.get("/files", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "No files exist"
      });
    }

    // Files exist
    return res.json(files);
  });
});
router.get("/files/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists"
      });
    }
    // File exists
    return res.json(file);
  });
});
// @desc Display Image
router.get("/image/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists"
      });
    }

    // Check if image
    if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: "Not an image"
      });
    }
  });
});

passport.use(
  new LocalStrategy({ usernameField: "email" }, function(
    email,
    password,
    done
  ) {
    User.getUserByEmail(email, function(err, user) {
      if (err) throw err;
      if (!user) {
        return done(null, false, { message: "Unknown User" });
      }

      User.comparePassword(password, user.password, function(err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          console.log(password);
          return done(null, user);
        } else {
          return done(null, false, { message: "Invalid Password" });
        }
      });
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true
  }),
  function(req, res) {
    res.redirect("/");
  }
);

//update

router.post("/update", ensureAuthenticated, upload.single("file"), function(
  req,
  res
) {
  console.log(req.file);

  var id = req.user._id;
  id = new ObjectID(id);
  var username = req.body.username;
  var email = req.body.email;
  var age = req.body.age;
  var company = req.body.company;
  var address = req.body.address;
  var contact = req.body.contact;
  if (req.file) {
    gfs.remove({ filename: req.user.img, root: "users" }, (err, gridStore) => {
      if (err) {
        return res.status(404).json({ err: err });
      } else {
        console.log("image deleted");
      }
    });
    var img = req.file.filename;
  } else {
    var img = req.user.img;
  }

  let errors = [];

  if (!username || !email || !address || !company || !age || !contact) {
    errors.push({ msg: "Please enter all fields" });
  }
  var ere = new RegExp(
    "(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])"
  );

  if (!ere.test(email)) {
    errors.push({ msg: "E-mail Format is not correct" });
  }

  if (errors.length > 0) {
    res.render("update", { errors: errors });
  } else {
    User.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          username: username,
          age: req.body.age,
          email: email,
          contact: contact,
          company: company,
          address: address,
          img: img
        }
      }
    ).exec(function(err, result) {
      if (err) throw err;
      else {
        req.flash("success_msg", "Information is updated");

        res.redirect("/");
      }
    });
  }
});

//logout
router.get("/logout", function(req, res) {
  req.logout();

  req.flash("success_msg", "You are Logged out!");
  res.redirect("/users/login");
});

module.exports = router;
