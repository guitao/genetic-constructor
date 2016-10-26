"use strict";

var assert = require("assert");
var async = require("async");
var urlSafeBase64 = require("urlsafe-base64");
var request = require("supertest");
var describeAppTest = require("../../../api-app");

var Project = require('../../../../lib/project');

var owner = '810ffb30-1938-11e6-a132-dd99bc746800';

describeAppTest("http", function (app) {
  describe('api project routes', function () {
    this.timeout(15000);

    var projectId0 = 'b091da207742e81dae58257a323e3d3b';

    after(function (done) {
      Project.destroy({
        where: {
          owner: owner,
        },
      }).then(function (numDeleted) {
        console.log('deleted ' + numDeleted + ' projects');
        done();
      }).catch(function (err) {
        console.error('project cleanup error', err);
        done(err);
      });
    });

    it('should save a new project', function saveNewProject(done) {

      var data = {
        chicago: 'blackhawks',
      };

      request(app.proxy)
        .post('/api/projects')
        .send({
          owner: owner,
          id: projectId0,
          data: data,
        })
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.notEqual(res, null);
          assert.notEqual(res.body, null);
          // console.log('save res:', res.body);
          assert.notEqual(res.body.uuid, null);
          assert.equal(res.body.owner, owner);
          assert.equal(res.body.version, 0);
          assert.equal(res.body.status, 1);
          assert.equal(res.body.id, projectId0);
          assert.deepEqual(res.body.data, data);
          assert.notEqual(res.body.createdAt, null);
          assert.notEqual(res.body.updatedAt, null);
          done();
        });
    });

    it('should fetch the latest project version by \'id\'', function fetchLatestProjectVersion(done) {
      request(app.proxy)
        .get('/api/projects/' + projectId0)
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.notEqual(res, null);
          assert.notEqual(res.body, null);
          // console.log('fetch by project id result:', res.body);
          // TODO make sure we actually got the latest version when we have multiple versions
          done();
        });
    });

    it('should fetch projects by \'ownerId\'', function fetchProjectsByOwnerId(done) {
      var buffer = new Buffer(owner, 'utf8');
      request(app.proxy)
        .get('/api/projects/owner/' + urlSafeBase64.encode(buffer))
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.notEqual(res, null);
          assert.notEqual(res.body, null);
          // console.log('fetch by owner result:', res.body);
          assert(Array.isArray(res.body));
          done();
        });
    });

    it('should update the latest version of the project', function updateLatestVersion(done) {
      var data = {
        chicago: 'blackhawks',
        championships: 6,
      };

      request(app.proxy)
        .post('/api/projects/' + projectId0)
        .send({
          data: data,
        })
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.notEqual(res, null);
          assert.notEqual(res.body, null);
          // console.log`('update result:', res.body);
          assert.deepEqual(res.body.data, data);
          done();
        });
    });

    it('should update a specific project with owner, id, and version', function updateSpecific(done) {
      var data = {
        chicago: 'blackhawks',
        championships: 6,
        biggestFan: 'DEH',
      };

      var uuidBuf = new Buffer(owner, 'utf8');

      request(app.proxy)
        .post('/api/projects/' + projectId0 + '?owner=' + urlSafeBase64.encode(uuidBuf) + '&version=0')
        .send({
          data: data,
        })
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.notEqual(res, null);
          assert.notEqual(res.body, null);
          // console.log`('update result:', res.body);
          assert.deepEqual(res.body.data, data);
          done();
        });
    });

    it('should delete a project with id', function deleteById(done) {
      request(app.proxy)
        .delete('/api/projects/' + projectId0)
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.notEqual(res, null);
          assert.notEqual(res.body, null);
          assert.equal(res.body.numDeleted, 1);
          return request(app.proxy)
            .get('/api/projects/' + projectId0)
            .expect(404)
            .end(function (err, res) {
              assert.ifError(err);
              assert.notEqual(res, null);
              assert.notEqual(res.body, null);
              assert.equal(res.body.message, 'projectId ' + projectId0 + ' does not exist');
              done();
            });
        });
    });

    it('should find a project that contains a blockId', function testGetByBlockId(done) {
      var projectId = 'project-364d0c6a-6f08-4fff-a292-425ca3eb91cc';
      var data = {
        "id": "project-364d0c6a-6f08-4fff-a292-425ca3eb91cc",
        "parents": [],
        "metadata": {
          "name": "EGF Sample Templates",
          "description": "This project includes a set of templates - combinatorial constructs with biological function - which can be fabricated at the Edinburgh Genome Foundry. This sample project is locked. To use the templates, drag them from the inventory list on the left, into one of your own projects.",
          "authors": [
            "11111111-1111-1111-9111-111111111111"
          ],
          "created": 1477335218195,
          "tags": {}
        },
        "lastSaved": 0,
        "components": [
          "block-0c0f7b43-7f1f-4b6b-a34e-f8a3cf78f5ab",
          "block-9918e893-9211-4b18-9c3e-3a7d63bc5186",
          "block-575e9425-a857-415d-9bd4-f15c2f128a1e",
          "block-e42053ff-0b34-45d8-a466-b771227372d2",
          "block-5a073ec0-424c-48c6-a114-503dba024ff8",
          "block-3a500271-3d10-4335-a910-0c4a29f2f075",
          "block-696d0861-c543-4bb8-b8c0-3786ae62e76d",
          "block-59aa6701-1ca6-4533-8755-bd60d71c9968",
          "block-eaf1fe6b-df94-451d-a6e5-7feaa0ae31a1",
          "block-f06a07be-a2fa-429e-b369-d00ee5a560f1",
          "block-d8a726cd-bd92-430d-99e4-cfa93909e3c6",
          "block-3fe9e68d-8d86-4a59-802b-16803d00cf9c",
          "block-2eae30ba-96de-4573-900c-cdd2bb7fb548",
          "block-5654de79-0194-4aa6-bd71-d8e759f9d262",
          "block-3f1eaa30-2f5f-4871-b9a8-4fc13b5cac9c",
          "block-e6275880-6997-4f6d-878d-aadd3fa9157f",
          "block-ab025abd-e2f8-4208-ad38-64efefde6762",
          "block-0dbc139b-fb86-4bff-a8e6-d130d0307a41",
          "block-1f928dae-6ed0-4132-883d-26f89da3e627",
          "block-2484f7f5-999c-4fba-86ed-46719f7fd784",
          "block-ed7ce4f5-afb6-4385-81fc-b482f45fd3c4",
          "block-a73e921b-68e2-4fe5-9c84-2869ac65cf78",
          "block-64638482-c233-4859-9068-c2a7af9fea82",
          "block-d33b2715-de94-4326-bf2f-2345742dcf17",
          "block-d49b854e-4da7-4138-bfb7-2d1a2ad8dc77",
          "block-b6718596-1a84-481f-aa92-901e02fa27d6",
          "block-7d3bfa9d-2409-4efc-ab65-1fb8d86c892f",
          "block-457af5b9-ab52-4552-8a77-47bf3dc22093",
          "block-1c7c8600-0b6e-4fc9-80f0-e11d655e25d7"
        ],
        "settings": {},
        "isSample": true
      };

      async.series([
        function (cb) {
          request(app.proxy)
            .post('/api/projects/')
            .send({
              owner: owner,
              id: projectId,
              data: data,
            })
            .expect(200)
            .end(function (err, res) {
              cb(err, res.body);
            });
        },
        function (cb) {
          request(app.proxy)
            .get('/api/projects/block/' + 'block-0c0f7b43-7f1f-4b6b-a34e-f8a3cf78f5ab')
            .expect(200)
            .end(function (err, res) {
              cb(err, res.body);
            });
        },
      ], function (err, results) {
        assert.ifError(err);
        assert.equal(results.length, 2);
        assert.equal(results[1].length, 1);
        assert.deepEqual(results[0], results[1][0]);
        return done();
      });
    });
  });
});