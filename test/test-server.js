const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// this lets us use *should* style syntax in our tests
const should = chai.should;
const expect = chai.expect;

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
    .get('/')
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
      .post('/')
      .send(newPost)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('title', 'content', 'author');
        res.body.id.should.not.be.null;
        // response should be deep equal to `newPost` from above if we assign
        // `id` to it from `res.body.id`
        res.body.should.deep.equal(Object.assign(newPost, {id: res.body.id}));
      });
  });

  it('should update post on PUT', function() {
    const updatePost = {
      title: 'Post #1update',
      content: 'Is this content updated?',
      author: 'Ginger'
    };

    return chai.request(app)
      .get('/')
      .then(function(res) {
        updatePost.id = res.body[0].id;
        return chai.request(app)
        .put(`/${updatePost.id}`)
        .send(updatePost);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });

  it('should delete items on DELETE', function() {
    return chai.request(app)
      // first have to get so we have an `id` of item
      // to delete
      .get('/')
      .then(function(res) {
        return chai.request(app)
          .delete(`/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});
