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
/*
 This file creates starting content for users

 NOTE - create instances using Block.classless and Project.classless - the server is expect JSON blobs that it can assign to, and instances of classes are frozen.
 */
import invariant from 'invariant';
import * as rollup from '../data/rollup';
import { getConfigFromUser } from '../user/utils';

//NOTE - egf_parts vs egf_templates
import makeEgfRollup from '../../data/egf_parts/index';
import emptyProjectWithConstruct from '../../data/emptyProject/index';

//while we are using imports, do this statically. todo - use require() for dynamic (will need to reconcile with build eventually, but whatever)
//these are parameterized generators of projects, which return promises
const projectMap = {
  egf_templates: (config, user) => makeEgfRollup(),
  emptyProject: (config, user) => emptyProjectWithConstruct(true),
};

//create rollup generators, where first is the one to return as final project ID
//return generator so created can control timestamp
const createGeneratorsInitialProjects = (user) => {
  const config = getConfigFromUser(user);

  const projectGenerators = Object.keys(config.projects)
    .map(projectKey => ({
      id: projectKey,
      ...config.projects[projectKey],
      generator: projectMap[projectKey],
    }))
    .sort((one, two) => one.default ? -1 : 1)
    .filter(projectConfig => typeof projectConfig.generator === 'function')
    .map(projectConfig => () => projectConfig.generator(projectConfig, user));

  invariant(projectGenerators.length >= 1, '[User Setup] must have some default projects, got none. check config for user ' + user.uuid + ' -- ' + Object.keys(config.projects).join(', '));

  return projectGenerators;
};

//create initial projects and set up configuration for them
export default function onboardNewUser(user) {
  //debug
  const start = process.hrtime();
  console.log('[User Setup] Onboarding ' + user.uuid + ' ' + user.email);

  const initialProjectGenerators = createGeneratorsInitialProjects(user);
  const [firstRollGen, ...restRollGens] = initialProjectGenerators;

  //generate the firstRoll last, so that it has the most recent timestamp, and is opened first
  return Promise.all(
    restRollGens.map(generator => {
      const roll = generator();

      if (process.env.NODE_ENV === 'test') {
        const mid = process.hrtime();
        const time = (mid[0] - start[0]) + ((mid[1] - start[1]) / Math.pow(10, 9));
        console.log('made first roll ' + user.email + ' took ', time);
      }

      return rollup.writeProjectRollup(roll.project.id, roll, user.uuid, true);
    })
  )
    .then((restRolls) => {
      if (process.env.NODE_ENV === 'test') {
        const mid = process.hrtime();
        const time = (mid[0] - start[0]) + ((mid[1] - start[1]) / Math.pow(10, 9));
        console.log('wrote first roll ' + user.email + ' took ', time);
      }

      const roll = firstRollGen();
      return rollup.writeProjectRollup(roll.project.id, roll, user.uuid, true)
        .then(firstRoll => {
          //debug
          if (process.env.NODE_ENV === 'test') {
            const end = process.hrtime();
            const time = (end[0] - start[0]) + ((end[1] - start[1]) / Math.pow(10, 9));
            console.log('\n\nonboarding ' + user.email + ' took ', time);
          }

          return [firstRoll, ...restRolls];
        });
    });
}
