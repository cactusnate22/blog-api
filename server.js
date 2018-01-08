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

app.get('/blog-posts/:id', (req, res) => {
  BlogPost
    .findById(req.params.id)
    .then(post => res.json(post.serialize()))
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

app.post('/blog-posts', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  BlogPost
      .create({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author
      })
      .then(blogPost => res.status(201).json(blogPost.serialize()))
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
      });

  });

  app.delete('/blog-posts/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({ message: 'success' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

//solution had this additional delete by ID code...why?
app.delete('/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted blog post with id \`${req.params.ID}\``);
      res.status(204).end();
    });
});

app.put('/blog-posts/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['title', 'content', 'author'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  BlogPost
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

app.use('*', function (req, res) {
  res.status(404).json({ message: 'Not Found' });
});

let server;
//not needed unless I need to create a public folder
// app.use(express.static('public'));

// this function connects to our database, then starts the server
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { useMongoClient: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };
//----------------------------------------------------------
// function runServer() {
//   const port = process.env.PORT || 8080;
//   return new Promise((resolve, reject) => {
//     server = app.listen(port, () => {
//       resolve(server);
//     }).on('error', err => {
//       reject(err)
//     });
//   });
// }
//
// function closeServer() {
//   return new Promise((resolve, reject) => {
//     server.close(err => {
//       if (err) {
//         reject(err);
//         return;
//       }
//       resolve();
//     });
//   });
// }
//
// // if server.js is called directly (aka, with `node server.js`), this block
// // runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
// if (require.main === module) {
//   runServer().catch(err => console.error(err));
// };
//
// module.exports = {app, runServer, closeServer};
