const express = require('express');
const morgan = require('morgan');

//is this needed since I only have one router file?
const blogRouter = require('./routers/blog-posts');
const app = express();

app.use(morgan('common'));

//saw in solution...where is /blog-posts?
app.use('/blog-posts', blogRouter)

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
        // so we don't also call `resolve()`
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
