const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// this lets us use *should* style syntax in our tests
// const should = chai.should;
const expect = chai.expect;
chai.should();
chai.use(chaiHttp);

describe('blog-api', function() {
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should list blog posts on GET', function() {
    return chai.request(app)
    .get('/blog-posts')
    .then(function(res) {
      res.should.have.status(200);
      // expect.res.to.have.status(200);
      res.should.be.json;
      res.body.should.be.a('array');
      const expectedKeys = ['title', 'content', 'author'];
      res.body.forEach(function(item) {
        item.should.be.a('object');
        item.should.include.keys(expectedKeys);
      });
    });
  });

  it('should add new POST on POST', function() {
    const newPost = {title: 'post number one', content: 'This is post number one!!!',  author: "N.Ash"};
    return chai.request(app)
      .post('/blog-posts')
      .send(newPost)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('title', 'content', 'author');
        res.body.id.should.not.be.null;
        // response should be deep equal to `newPost` from above if we assign
        // `id` to it from `res.body.id`
        // res.body.should.deep.equal(Object.assign(newPost, {id: res.body.id}));
        Object.keys(newPost).forEach(key => {
          res.body[key].should.equal(newPost[key])
        });
      });
  });

//need to have a function that handles errors if expected values are missing

  it('should update post on PUT', function() {
    const newPost = {
      title: 'Lorem Ipsum',
      content: 'Porro cupiditate beatae quaerat et cumque veniam.',
      author: 'Ginger'
    };

    return chai.request(app)
      .post('/blog-posts')
      .send(newPost) // first I'm creating a new post
      .then(function (res) {
        return res.body
      }) // get only the body containing the post object
      .then(function (post) {
        // updates the post (append some text to title)
        post.title += ' - Updated!'

        // updates it with a PUT request
        return chai.request(app)
        .put(`/blog-posts/${post.id}`)
        .send(post)
      })
      .then(function (res) {
        res.should.have.status(204);
      });
  });

  it('should delete items on DELETE', function() {
    const newPost = {
      title: 'Lorem Ipsum',
      content: 'DELETE ME.',
      author: 'ASH'
    };
    return chai.request(app)
      // first have to get so we have an `id` of item
      // to delete
      .post('/blog-posts')
      .send(newPost)
      .then(function(res) {
        return chai.request(app)
          .delete(`/blog-posts/${res.body.id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});
