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
    console.log('EvnApp admin database connected');
    
  })
  .catch(err => {
    console.log(err);
    
  });

router.get("/admin/dashboard", (req, res) => { 
  mongoose
      .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
      .then(client => {
        Events.find().exec((err, events) => {
          if(err) return next(err);
          Blogs.find().exec((err, blogs) => {
            if(err) return next(err);
            res.render("./admin/dashboard", {events: events, blogs: blogs});
          });
        });
      });
    client.close(); 
});

// events
 // SET STORAGE
 var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/events')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + file.originalname)
  }
});
 
var upload = multer({ storage: storage });

router.get("/admin/add-event", (req, res) => {
  res.render("./admin/add-event");
});

router.post('/uploadevent', upload.single('myEvent'), function (req, res){ 
  var newEvent = new Events({
    filename: req.file.filename,
    title: req.body.title,
    category: req.body.category,
    venue: req.body.venue,
    eventDate: req.body.eventDate,
    time: req.body.time,
    description: req.body.description,
    vip: req.body.vip,
    regular: req.body.regular
  });

  newEvent.save();
  console.log(newEvent); 
  mongoose
    .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(client => {
      res.redirect("/admin/manage-events");
    })
    .catch(err => {
    });
  client.close();
});

router.get("/admin/manage-events", (req, res) => { 
  mongoose
      .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
      .then(client => {
        Events.find().exec((err, event) => {
          if(err) return next(err);
          res.render("./admin/manage-events", {allEvents: event});
        });
      });
    client.close(); 
});

router.get("/admin/events/:id/view", (req, res) => {
  mongoose
  .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(client => {
     Events.findById({_id: req.params.id}, (err, docs) => {
       if (err) throw err;
       console.log(docs);
       res.json(docs);
     });
  })
  client.close();
})

router.get("/admin/events/:id", (req, res) => {
  mongoose
    .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(client => {
       Events.findById({_id: req.params.id}, (err, event) => {
         if (err) throw err;
         console.log(event);
         res.render("./admin/edit-event", {event: event});
       });
    })
    client.close(); 
})

router.post("/admin/events/:id/edit", (req, res) => {
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: true
    })
    .then(client => {
      Events.findOneAndUpdate(
        req.params.id,
        {$set: {title: req.body.title, category: req.body.category, venue: req.body.venue, eventDate: req.body.eventDate, time: req.body.time, description: req.body.description}},
        {new: true},
        (err, doc) => {
          if (err) throw err;
          console.log(doc);
          res.redirect("/admin/manage-events");
        }
      );
    });
  client.close();
});

router.get("/:id/deleteEvent", (req, res) => {
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
    .then(client => {
      Events.findByIdAndRemove({_id: req.params.id}, (err, event) => {
        if (err) throw err;
        fs.unlink(path.join("public/uploads/events", event.filename), err => {
          if (err) throw err;
          res.redirect("/admin/manage-events");
        });
      });
    })
  client.close();
});
// end events

// Blogs
 // SET STORAGE
 var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/blogs')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + file.originalname)
  }
});
 
var upload = multer({ storage: storage });

router.get("/admin/blog", (req, res) => { 
  mongoose
      .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
      .then(client => {
        Blogs.find().exec((err, blog) => {
          if(err) return next(err);
          res.render("./admin/blog", {allBlogs: blog});
        });
      });
    client.close(); 
});

router.post('/uploadblog', upload.single('myBlog'), function (req, res){ 
  var newBlog = new Blogs({
    filename: req.file.filename,
    title: req.body.title,
    category: req.body.category,
    author: req.body.author,
    content: req.body.content
  });

  newBlog.save();
  console.log(newBlog); 
  mongoose
    .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(client => {
      res.redirect("/admin/blog");
    })
    .catch(err => {
    });
  client.close();
});

router.get("/admin/blog/:id/edit-blog", (req, res) => {
  mongoose
    .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(client => {
       Blogs.findById({_id: req.params.id}, (err, blog) => {
         if (err) throw err;
         console.log(blog);
         res.render("./admin/edit-blog", {blog: blog});
       });
    })
    client.close(); 
})

router.post("/admin/blog/:id/edit-blog", (req, res) => {
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: true
    })
    .then(client => {
      Blogs.findOneAndUpdate(
        req.params.id,
        {$set: {title: req.body.title, author: req.body.author, content: req.body.content}},
        {new: true},
        (err, doc) => {
          if (err) throw err;
          res.redirect("/admin/blog");
        }
      );
    });
  client.close();
});
router.get("/admin/blog/:id/delete-blog", (req, res) => {
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
    .then(client => {
      Blogs.findByIdAndRemove({_id: req.params.id}, (err, blog) => {
        if (err) throw err;
        fs.unlink(path.join("public/uploads/blogs", blog.filename), err => {
          if (err) throw err;
          res.redirect("/admin/blog");
        });
      });
    })
  client.close();
});

router.get("/admin/blog-detail", (req, res) => { res.render("./admin/blog-detail"); });

router.get("/admin/notifications", (req, res) => { res.render("./admin/notifications"); });
//logout Handle
router.get("/logout", (req, res) => {
  mongoose
    .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(client => {
      req.logout();
      res.redirect("/");
    })
  client.close();
});

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