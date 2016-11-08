/*
 Copyright 2016 Autodesk,Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import { assert, expect } from 'chai';
import uuid from 'node-uuid';
import _ from 'lodash';
import { testUserId } from '../../../constants';
import { createExampleRollup } from '../../../_utils/rollup';
import { errorInvalidModel, errorAlreadyExists, errorDoesNotExist } from '../../../../server/utils/errors';
import Project from '../../../../src/models/Project';
import Order from '../../../../src/models/Order';

import * as projectPersistence from '../../../../server/data/persistence/projects';
import * as orderPersistence from '../../../../server/data/persistence/orders';

describe('Server', () => {
  describe('Data', () => {
    describe('persistence', () => {
      describe.only('orders', () => {
        const roll = createExampleRollup();
        const updated = _.merge({}, roll, { project: { another: 'field' } });

        const roll2 = createExampleRollup();
        const updated2 = _.merge({}, roll, { project: { another: 'field' } });

        let version = 1;

        const order = Order.classless({
          projectId: roll.project.id,
          projectVersion: version,
          user: testUserId,
          constructIds: [roll.project.components[0]],
          parameters: {
            onePot: true,
          },
          status: {
            foundry: 'egf',
          },
        });

        const order2 = Order.classless({
          projectId: roll2.project.id,
          projectVersion: version,
          user: testUserId,
          constructIds: [roll2.project.components[0]],
          parameters: {
            onePot: true,
          },
          status: {
            foundry: 'egf',
          },
        });

        before(() => {
          return projectPersistence.projectWrite(roll.project.id, roll, testUserId)
            .then(() => projectPersistence.projectWrite(roll.project.id, updated, testUserId));
        });

        it('orderList() returns 404 when no orders', (done) => {
          orderPersistence.orderList(Project.classless().id)
            .then((results) => done('shouldnt resolve'))
            .catch(err => {
              expect(err).to.equal(errorDoesNotExist);
              done();
            });
        });

        it('orderExists() resolves when an order exists', (done) => {
          orderPersistence.orderExists(order.id, order.projectId)
            .then(() => done('shouldnt resolve'))
            .catch((err) => {
              expect(err).to.equal(errorDoesNotExist);
              done();
            });
        });

        it('orderWrite() should fail on an invalid order', (done) => {
          const badOrder = Object.assign({}, order, { parameters: { onePot: 'bad' } });
          orderPersistence.orderWrite(order.id, badOrder, testUserId)
            .then(result => done('shouldnt resolve'))
            .catch(err => {
              expect(err).to.equal(errorInvalidModel);
              done();
            });
        });

        it('orderWrite() should require that the foundry is set', () => {
          const badOrder = Object.assign({}, order);
          delete badOrder.status.foundry;

          expect(() => orderPersistence.orderWrite(order.id, badOrder, testUserId)).to.throw();
        });

        it('orderWrite() should fail when version does not exist', (done) => {
          const badVersion = Object.assign({}, order, { projectVersion: 10 });
          orderPersistence.orderWrite(order.id, badVersion, testUserId)
            .then(result => done('shouldnt resolve'))
            .catch(err => {
              expect(err).to.equal(errorDoesNotExist);
              done();
            });
        });

        it('orderWrite() write makes an order', () => {
          return orderPersistence.orderWrite(order.id, order, testUserId);
        });

        it('orderGet() gets an order', () => {
          return orderPersistence.orderGet(order.id, order.projectId)
            .then(ord => {
              expect(ord).to.eql(order);
            });
        });

        it('orderExists() resolves when an order exists', () => {
          return orderPersistence.orderExists(order.id, order.projectId);
        });

        //todo
        it('orderList() lists orders which exist for a project');

        //todo
        it('orderList() lists orders only for given project');

        //todo
        it('orderWrite() should fail when version does not exist');

        it('orderDelete() is impossible', () => {
          expect(() => orderPersistence.orderDelete(order.id, order.projectId)).to.throw();
        });

        it('projectDelete() should remove orders', (done) => {
          projectPersistence.projectDelete(roll.project.id, testUserId)
            .then(() => orderPersistence.orderList(order.projectId))
            .then(() => done('shouldnt resolve'))
            .catch(err => {
              expect(err).to.equal(errorDoesNotExist);
              done();
            });
        });
      });
    });
  });
});
