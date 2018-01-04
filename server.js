const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Mongoose internally uses a promise-like object,
// but its better to make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;

// config.js is where we control constants for entire
// app like PORT and DATABASE_URL
const { PORT, DATABASE_URL } = require('./config');
const { BlogPost } = require('./models');


//is this needed since I only have one router file?
// const blogRouter = require('./routers/blog-posts');
const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

// app.use('/blog-posts', blogRouter)
app.get('/blog-posts', (req, res) => {
  BlogPost
    .find()
    .then(posts => {
      res.json(posts.map(post => post.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went wrong' });
    });
});

// SET UP FOR QUERYABLE FIELDS
// app.get('/blog-posts/', (req, res) => {
//   const filters = {};
//   const queryableFields = ['title', 'author'];
//   queryableFields.forEach(field => {
//     if (req.query[field]) {
//       filters[field] = req.query[field];
//     }
//   });
//   BlogPost
//   .find(filters)
//   .then(BlogPosts => res.json(
//     BlogPosts.map(blogPost => blogPost.serialize())
//   ))
//   catch(err => {
//     console.error(err);
//     res.status(500).json({message: 'Internal server error'})
//   });
// });

app.get('/blog-posts/:id', (req, res) => {
  BlogPost
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)
    .then( blogPost => res.json(blogPost.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

let server;
//not needed unless I need to create a public folder
// app.use(express.static('public'));
function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      resolve(server);
    }).on('error', err => {
      reject(err)
    });
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    server.close(err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
