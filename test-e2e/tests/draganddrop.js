var homepageRegister = require('../fixtures/homepage-register');
var signout = require('../fixtures/signout');
var signin = require('../fixtures/signin');
var dragFromTo = require('../fixtures/dragfromto');
var newProject = require('../fixtures/newproject');
var newConstruct = require('../fixtures/newconstruct');

module.exports = {
  'Test drag and drop on test project.' : function (browser) {

    // maximize for graphical tests
    browser.windowSize('current', 1200, 900);

    // register via fixture
    var credentials = homepageRegister(browser);

    // now we can go to the project page
    browser
      // wait for inventory and inspector to be present
      .waitForElementPresent('.SidePanel.Inventory', 5000, 'Expected Inventory Groups')
      .waitForElementPresent('.SidePanel.Inspector', 5000, 'Expected Inspector')

    // create three new constructs
    newConstruct(browser);
    newConstruct(browser);
    newConstruct(browser);

      // open inventory
    browser
      .click('.Inventory-trigger')
      .waitForElementPresent('.SidePanel.Inventory.visible', 5000, 'Expected inventory to be visible')
      // open inspector
      .click('.Inspector-trigger')
      .waitForElementPresent('.SidePanel.Inspector.visible', 5000, 'Expected inspector to be visible')
      // click the second inventory group 'EGF Parts' to open it
      .click('.InventoryGroup:nth-of-type(2) .InventoryGroup-heading')
      // expect at least one inventory item and one block to drop on
      .waitForElementPresent('.InventoryItem', 5000, 'expected an inventory item');
      // .waitForElementPresent('[data-nodetype="block"]', 5000, 'expected a block to drop on')
      // .assert.countelements('[data-nodetype="block"]', 7);

    // drag a block to each construct to start them off
    dragFromTo(browser, '.InventoryItemBlock:nth-of-type(1)', 10, 10, '.construct-viewer:nth-of-type(1) .sceneGraph', 30, 30);
    dragFromTo(browser, '.InventoryItemBlock:nth-of-type(2)', 10, 10, '.construct-viewer:nth-of-type(2) .sceneGraph', 30, 30);
    dragFromTo(browser, '.InventoryItemBlock:nth-of-type(3)', 10, 10, '.construct-viewer:nth-of-type(3) .sceneGraph', 30, 30);

    // drag an item from the inventory
    for(var j = 1; j <= 3; j += 1) {
      for(var i = 1; i <= 5; i += 1) {
        dragFromTo(
            browser,
            '.InventoryItemBlock:nth-of-type(' + i + ')', 10, 10,
            '.construct-viewer:nth-of-type(' + j + ') .sceneGraph .role-glyph:nth-of-type(1)', 30, 10);
      }
    }

    browser
      .pause(2000)
      .assert.countelements('[data-nodetype="block"]', 21)
      .end();
  }
};
