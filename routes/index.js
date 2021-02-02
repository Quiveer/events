const express = require('express');
const router = express.Router();
const fs = require('fs');
var path = require("path");
var mongoose = require("mongoose");
var multer = require("multer");
mongoose.Promise = global.Promise;
var async = require("async");
var crypto = require("crypto");
const bcrypt = require("bcryptjs");
const passport = require("passport");

var cors = require("cors");
router.use(cors());

const helmet = require("helmet");
router.use(helmet());

require("cookie-parser");

// models
const Blogs = require("../models/Blogs");
const Events = require("../models/Events");
// const Reviews = require("../models/reviews");
// const Gallery = require("../models/gallery");
// const Staff = require("../models/staff");
// const Contacts = require("../models/contact");
// const Reservations = require("../models/reservation");


mongoose.set("useCreateIndex", true);

const uri =
  "mongodb+srv://Trav:Grutika5_@bakery.gnzlr.gcp.mongodb.net/evenapp?retryWrites=true&w=majority";
const client = mongoose.createConnection(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

client
  .once("open", () => {
    console.log('EvnApp user database connected');
    
  })
  .catch(err => {
    console.log(err);
    
  });

router.get("/", (req, res) => { 
  mongoose
      .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
      .then(client => {
        Events.find().exec((err, event) => {
          if(err) return next(err);
          Blogs.find().exec((err, blog) => {
            if(err) return next(err);
            res.render("./user/index", {allEvents: event, allBlogs: blog});
          });
        });
      });
    client.close(); 
});

router.get("/events", (req, res) => { res.render("./user/events"); });
router.get("/blog", (req, res) => { 
  mongoose
      .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
      .then(client => {
        Blogs.find().exec((err, blog) => {
          if(err) return next(err);
          res.render("./user/blog", {allBlogs: blog});
        });
      });
    client.close(); 
});

router.get("/blog/:title", (req, res) => { 
  mongoose
    .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(client => {
       Blogs.findOne({title: req.params.title}, (err, blog) => {
         if (err) throw err;
         console.log(blog);
         res.render("./user/blog-detail", {blog: blog });
       });
    })
    client.close();
});
router.get("/about", (req, res) => { res.render("./user/about"); });
router.get("/contact", (req, res) => { res.render("./user/contact"); });
router.get("/hotels", (req, res) => { res.render("./user/hotels"); });
router.get("/clubs", (req, res) => { 
  mongoose
    .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(client => {
      Events.find({category: 'club'}).exec((err, club) => {
        if(err) return next(err);
        res.render("./user/clubs", {allClubs: club});
      });
    });
  client.close(); 
});
router.get("/outdoor", (req, res) => { res.render("./user/outdoor"); });
router.get("/churches", (req, res) => { res.render("./user/churches"); });
router.get("/djs", (req, res) => { res.render("./user/djs"); });
router.get("/artists", (req, res) => { res.render("./user/artists"); });
router.get("/conference", (req, res) => { res.render("./user/conference"); });

router.post("/signup", (req, res) => { res.redirect("./admin/dashboard"); });
router.post("/login", (req, res) => { res.redirect("./admin/dashboard"); });

// router.get("/dashboard", (req, res) => { 
//   mongoose
//         .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
//         .then(client => {
//           Tenants.find().exec((err, tenants) => {
//             if(err) return next(err);
//             res.render("dashboard", {tenants: tenants});
//           });
//         });
//       client.close();
// });

module.exports = router;