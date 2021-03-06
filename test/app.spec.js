/* eslint-disable quotes */
require('dotenv').config();
const app = require("../src/app");
let store = require("../src/store");
const knex = require("knex");
const testFixture = require('./testfixture');

describe("Bookmark endpoints", () => {
  let testDB;
  let testObjectSeed = testFixture.getFixture();
  const authTokenTest = "Bearer my-secret";

  before(() => {
    testDB = knex({
      client: 'pg',
      connection: process.env.DB_TEST_URL
    });
  });
  before(() => app.set('db', testDB));
  before(() => testDB('bookmarks').truncate());
  after(() => testDB('bookmarks').truncate());
  after(() => testDB.destroy());


  context("Database has seed", () => {
    beforeEach(() => testDB('bookmarks').insert(testObjectSeed));
    afterEach(() => testDB('bookmarks').truncate());
    describe("GET all bookmarks happy path", () => {
      it("Gets the bookmarks", () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", authTokenTest)
          .expect(200)
          .then(res => {
            expect(res.body).to.eql(testObjectSeed);
          });
      });

      it("should get a particular book by ID from store", () => {
        const idForTest = 1;
        return supertest(app)
          .get(`/bookmarks/${idForTest}`)
          .set("Authorization", authTokenTest)
          .expect(201, testObjectSeed[0]);
      });

      it("should delete the bookmark specified by id", () => {
        return supertest(app)
          .delete("/bookmarks/1")
          .set("Authorization", authTokenTest)
          .expect(201);
      });
    });

    context("Database is empty", () => {
      beforeEach(() => testDB('bookmarks').truncate());

      it("Gets the bookmarks", () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", authTokenTest)
          .expect(200)
          .then(res => {
            expect(res.body).to.eql([]);
          });
      });

      it("should get a particular book by ID from store", () => {
        const idForTest = 1;
        return supertest(app)
          .get(`/bookmarks/${idForTest}`)
          .set("Authorization", authTokenTest)
          .expect(404);
      });
    });
  });

  it("posts a bookmark to the store", () => {
    const postValues = {
      title: "test-title",
      url: "http://some.thing.com",
      rating: "1",
    };
    return supertest(app)
      .post("/bookmarks")
      .send(postValues)
      .set("Authorization", authTokenTest)
      .expect(201)
      .expect((res) => {
        expect(res.body.title).to.equal(postValues.title);
        expect(res.body.url).to.equal(postValues.url);
      });
  });

});





