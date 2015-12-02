import uuid from 'node-uuid';
import getRecursively from './getRecursively';
import { get, getSafe, set } from './database';

export const makeHistoryKey = (id) => id + '-history';

/**
 * @description Creates an new instance which is a descendent of the input instance. Does not interact with database.
 * @param instance
 * @returns {*}
 */
export const createDescendant = (instance) => {
  return Object.assign({}, instance, {
    id: uuid.v4(),
    parent: instance.id,
  });
};

/**
 * @description Record parent-child info in the database
 * @param {uuid} childId
 * @param {uuid} parentId
 @return {Promise} array, where [0] is ancestry of child, [1] is descendants of parent, and each takes the form:
 * {
 *   id: ID of the relevant instance
 *   ancestors: all ancestors as an array, where index=0 is the direct parent
 *   descendants: direct descendants of the instance
 * }
 */
export const record = (childId, parentId) => {
  //todo - in the future, we should not record both parent and child relationships, but use an index on parent, or create a hash in redis that handles the children part. There should not be a need to have a double-linked list
  //todo - need to handle ACID assurances
  const ancestryKey = makeHistoryKey(childId);
  const descendantsKey = makeHistoryKey(parentId);

  return getSafe(descendantsKey, {id: parentId, ancestors: [], descendants: []})
    .then(history => {
      const { ancestors, descendants } = history;
      
      const newAncestors = {
        id: childId,
        ancestors: [parentId].concat(ancestors),
        descendants: []
      };


      const newDescendants = Object.assign(history, {
        descendants: descendants.concat(childId)
      });

      return Promise.all([
        set(ancestryKey, newAncestors),
        set(descendantsKey, newDescendants),
      ]);
    });

  
};

/**
 * @description Get all ancestors
 * @param instanceId {uuid}
 * @returns {Promise<Array>} Returns array of ancestors, direct parent first, or empty array if root
 */
export const getAncestors = (instanceId) => {
  const ancestryKey = makeHistoryKey(instanceId);
  return getSafe(ancestryKey, {ancestors: []})
    .then(history => {
      return history.ancestors;
    });
};

export const getDescendants = (instanceId) => {
  const descendencyKey = makeHistoryKey(instanceId);
  return getSafe(descendencyKey, {descendants: []})
  .then(history => {
    return history.descendants;
  });
};


/**
 * @description Recursively retrieves descendants for an instance
 * @param instanceId
 * @param depth {number}
 * @returns {Promise<Object>}
 */
export const getDescendantsRecursively = (instanceId, depth) => {
  return getRecursively(
    [makeHistoryKey(instanceId)],
    (instance) => instance.descendants.map(makeHistoryKey),
    depth
  );
};

export const getRoot = (instanceId) => {
  return getAncestors(instanceId)
    .then(result => {
      (result.leaves.length > 1) && console.error('more than one root', result.leaves); //eslint-disable-line
      return result.leaves[0];
    });
};

//get root, get whole tree
export const getTree = (id) => {
  //not tested
  return getRoot(id)
    .then(instance => {
      return getDescendantsRecursively(instance.id);
    });
};

export const getLeaves = (instance) => {
  //todo
};