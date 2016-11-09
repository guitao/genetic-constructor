"use strict";

var assert = require("assert");
var async = require("async");
var request = require("supertest");
var describeAppTest = require("../../../api-app");

var each = require('underscore').each;
var extend = require('underscore').extend;
var isEqual = require('underscore').isEqual;
var pairs = require('underscore').pairs;
var pick = require('underscore').pick;
var reduce = require('underscore').reduce;

var uuidValidate = require("uuid-validate");

var Project = require('../../../../lib/project');

var InputData = require('../../../inputs/gcprojects-dc606c20-a085-11e6-9219-130ec77419b4.json');
var KeyedProjects = {};

describeAppTest("http", function (app) {
  describe('api block queries', function () {
    this.timeout(15000);

    var owner = null;

    before(function (done) {
      assert.notEqual(InputData, null);
      assert(Array.isArray(InputData));
      console.log("Loading", InputData.length, "for blocks tests.");
      async.reduce(InputData, null, function (lastOwner, nextProject, callback) {
        assert.notEqual(nextProject.owner, null);
        assert((lastOwner == null) || (lastOwner === nextProject.owner), "InputData Error: project owners don't match");
        owner = nextProject.owner; // setting this here helps with Project cleanup should `before` fail later
        KeyedProjects[nextProject.id] = nextProject;
        request(app.proxy)
          .post('/api/projects')
          .send(extend({}, pick(nextProject, ['owner', 'id', 'version', 'data'])))
          .expect(200)
          .end(function (err, res) {
            assert.ifError(err);
            assert.notEqual(res, null);
            assert.notEqual(res.body, null);
            assert.equal(res.body.owner, nextProject.owner);
            return callback(err, res.body.owner);
          });
      }, function (err, result) {
        assert.ifError(err);
        console.log('Projects loaded for owner:', result);
        done();
      });
    });

    after(function (done) {
      async.series([
        function (cb) {
          return Project.destroy({
            where: {
              owner: owner,
            },
          }).then(function (numDeleted) {
            console.log('deleted ' + numDeleted + ' projects');
            cb();
          }).catch(function (err) {
            console.error('project cleanup error', err);
            cb(err);
          });
        },
      ], function (err) {
        done(err);
      });
    });

    it('should fetch projects w/o blocks', function fetchWithoutBlock(done) {
      request(app.proxy)
        .get('/api/projects/owner/' + owner)
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.notEqual(res, null);
          assert.notEqual(res.body, null);
          assert(Array.isArray(res.body));
          assert.equal(res.body.length, InputData.length);
          each(res.body, function (project) {
            assert.notEqual(project, null);
            assert.notEqual(project.data, null);
            var blocks = project.data.blocks;
            assert((blocks == null) || isEqual(blocks, {}));
          });
          done();
        });
    });

    it('should fetch projects w/ blocks', function fetchWithoutBlock(done) {
      request(app.proxy)
        .get('/api/projects/owner/' + owner + '?blocks=true')
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.notEqual(res, null);
          assert.notEqual(res.body, null);
          assert(Array.isArray(res.body));
          assert.equal(res.body.length, InputData.length);
          each(res.body, function (project) {
            assert.notEqual(project, null);
            assert.notEqual(project.data, null);
            var blocks = project.data.blocks;
            assert.notEqual(blocks, null);
            assert.notDeepEqual(blocks, {});
            assert.deepEqual(blocks, KeyedProjects[project.id].data.blocks);
          });
          done();
        });
    });
  });
});