const express = require('express');
const morgan = require('morgan');

//is this needed since I only have one router file?
const blogRouter = require('./routers/blog-posts');
const app = express();

app.use(morgan('common'));

//saw in solution...where is /blog-posts?
app.use('/blog-posts', blogRouter)

//not needed unless I need to create a public folder
// app.use(express.static('public'));


//not sure about this...will requests come anywhere but to root?
//app.use('/', blogRouter);

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
