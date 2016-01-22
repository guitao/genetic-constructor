import { expect } from 'chai';
import { importProject } from '../../extensions/convert/import';

const fs = require('fs');

describe('Features Extensions', () => {
  it('should be able convert feature file to Blocks', done => {
    fs.readFile('./test/res/sampleFeatureFile.tab', 'utf8', (err, sampleFeatures) => {
      importProject('features', sampleFeatures, result => {
        expect(result.project.components.length === 125).to.equal(true);
        expect(result.blocks[ result.project.components[19] ].metadata.name === '19:CBDcenA ').to.equal(true);
        done();
      });
    });
  });
});
