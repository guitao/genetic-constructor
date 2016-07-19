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
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { inspectorToggleVisibility } from '../actions/ui';
import { _getFocused } from '../selectors/focus';

import InspectorRole from '../components/Inspector/InspectorRole';
import InspectorBlock from '../components/Inspector/InspectorBlock';
import InspectorProject from '../components/Inspector/InspectorProject';

import '../styles/Inspector.css';
import '../styles/SidePanel.css';

export class Inspector extends Component {
  static propTypes = {
    showingGrunt: PropTypes.bool,
    isVisible: PropTypes.bool.isRequired,
    inspectorToggleVisibility: PropTypes.func.isRequired,
    readOnly: PropTypes.bool.isRequired,
    forceIsConstruct: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
    focused: PropTypes.any.isRequired,
  };

  toggle = (forceVal) => {
    this.props.inspectorToggleVisibility(forceVal);
  };

  render() {
    const { showingGrunt, isVisible, focused, orders, type, readOnly, forceIsConstruct } = this.props;

    // inspect instances, or construct if no instance or project if no construct or instances
    let inspect;
    switch (type) {
    case 'role' :
      inspect = (<InspectorRole roleId={focused} readOnly />);
      break;
    case 'project':
      inspect = (<InspectorProject instance={focused}
                                   orders={orders}
                                   readOnly={readOnly}/>);
      break;
    case 'construct':
    default:
      inspect = (<InspectorBlock instances={focused}
                                 orders={orders}
                                 readOnly={readOnly}
                                 forceIsConstruct={forceIsConstruct}/>);
      break;
    }

    return (
      <div className={'SidePanel Inspector no-vertical-scroll' +
      (isVisible ? ' visible' : '') +
      (readOnly ? ' readOnly' : '') +
      (showingGrunt ? ' gruntPushdown' : '')}>

        <div className="SidePanel-heading">
          <button tabIndex="-1" className="button-nostyle SidePanel-heading-trigger Inspector-trigger"
                  onClick={() => this.toggle()}/>
          <div className="SidePanel-heading-content">
            <span className="SidePanel-heading-title">Inspector</span>
            <button tabIndex="-1" className="button-nostyle SidePanel-heading-close"
                    onClick={() => this.toggle(false)}/>
          </div>
        </div>

        <div className="SidePanel-content">
          {inspect}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  const { isVisible } = state.ui.inspector;
  //UI adjustment
  const showingGrunt = !!state.ui.modals.gruntMessage;

  const { level, projectId, blockIds } = state.focus;
  //if projectId is not set in store, ProjectPage is passing it in, so lets default to it
  const currentProject = state.projects[projectId || props.projectId];

  //delegate handling of focus state handling to selector
  const { type, readOnly, focused } = _getFocused(state, true, props.projectId);

  const forceIsConstruct = (level === 'construct') ||
    blockIds.some(blockId => currentProject.components.indexOf(blockId) >= 0);

  const orders = Object.keys(state.orders)
    .map(orderId => state.orders[orderId])
    .filter(order => order.projectId === currentProject.id && order.isSubmitted())
    .sort((one, two) => one.status.timeSent - two.status.timeSent);

  return {
    showingGrunt,
    isVisible,
    type,
    readOnly,
    focused,
    forceIsConstruct,
    orders,
  };
}

export default connect(mapStateToProps, {
  inspectorToggleVisibility,
})(Inspector);
