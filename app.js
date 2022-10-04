require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const md5=require("md5");
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require("express-session"); // first thing to requere
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();



app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({ ///tell the app to use session packge
  secret: "AbuEssa",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize()); //tell the app to use passport and initialize it
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");


const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/logout",function(req,res){
  req.logout(function(err){
    if (err) {
      console.log(err);
    } else {
        res.redirect("/");
    }
  });

});


app.get("/secrets", function(req,res){
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.route("/login")
  .get(function(req, res) {
    res.render("login");
  })
  .post(function(req, res) {

    // const username = req.body.username;
    // const password = req.body.password;
    //
    // User.findOne({
    //   email: username
    // }, function(err, foundUser) {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     if (foundUser) {
    //       bcrypt.compare(password, foundUser.password, function(err, result) {
    //   if (result===true) {
    //     res.render("secrets");
    //   }
    //   });
    //
    //
    //     }
    //   }
    // });
const user=new User({
  username:req.body.username,
  password:req.body.password
});

req.login(user,function(err){
  if (err) {
    console.log(err);
  } else {
    passport.authenticate("local")(req,res, function(){
      res.redirect("/secrets");
    });
  }
});


}); ///End login



app.route("/register")
  .get(function(req, res) {
    res.render("register");
  })
  .post(function(req, res) {
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //   const newUser = new User({
    //     email: req.body.username,
    //     password: hash
    //   });
    //   newUser.save(function(err) {
    //     if (!err) {
    //       res.render("secrets");
    //     } else {
    //       console.log(err);
    //     }
    //   });
    // });
    User.register({username:req.body.username}, req.body.password,function(err,user){
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req,res, function(){
          res.redirect("/secrets");
        });
      }
    });

  });


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
