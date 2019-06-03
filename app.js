var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var expressValidator = require("express-validator");
var flash = require("connect-flash");
var session = require("express-session");
var LocalStrategy = require("passport-local").Strategy;
var mongo = require("mongodb");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
const passport = require("passport");
var hbs = require("hbs");
const Grid = require("gridfs-stream");
var User = require("./models/user");
const crypto = require("crypto");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

mongoose.connect("mongodb://localhost/imgg");
mongoose.Promise = global.Promise;
var conn = mongoose.connection;

var routes = require("./routes/index");
var users = require("./routes/users");
var table = require("./routes/table");
var search = require("./routes/search");
var editable = require("./routes/editable");

//hbs

hbs.registerHelper("each", function(context, options) {
  var ret = "";

  for (var i = 0, j = context.length; i < j; i++) {
    ret = ret + options.fn(context[i]);
  }

  return ret;
});
//init gfs

let gfs;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("users");
  global.gfs = gfs;
});

// Init app
var app = express();

// View Engine
app.set("views", path.join(__dirname, "views"));
app.engine("hbs", exphbs({ defaultLayout: "layout.hbs" }));
app.set("view engine", "hbs");

// Bdyparser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride());

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// express session
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true
  })
);

// express validator
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);
//passport init
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

// global vars
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

app.post("/getdata", function(req, res) {
  console.log(req.query.id);
  var id = req.query.id;
  User.findById(id, function(err, ress) {
    if (err) throw err;
    else {
      res.send(ress);
    }
  });
});

app.use("/", routes);
app.use("/table", table);

app.use("/users", users);
app.use("/search", search);
app.use("/editable", editable);
// set port
app.set("port", process.env.PORT || 3000);

app.listen(app.get("port"), function() {
  console.log("Server started on port " + app.get("port"));
});

module.exports = { conn };
