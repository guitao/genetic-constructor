import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

import Inventory from './Inventory';
import Inspector from './Inspector';
import ProjectDetailView from '../components/ProjectDetailView';
import ProjectHeader from '../components/ProjectHeader';
import SketchConstruct from './SketchConstruct';

import '../styles/ProjectPage.css';

//todo - should abstract away component which has dragDropContext, inventory, inspector

@DragDropContext(HTML5Backend)
export class ProjectPage extends Component {
  static propTypes = {
    constructs: PropTypes.array.isRequired,
    project: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    constructId: PropTypes.string, //only visible if a construct is selected

    children: PropTypes.func, //react-router
    pushState: PropTypes.func.isRequired,
  }

  render() {
    const { children, constructId, project, constructs } = this.props;

    //todo - need error handling here. Should be in route transition probably?
    //right now there is some handling in GlobalNav when using ProjectSelect. Doesn't handle request of the URL.
    if (!project || !project.metadata) {
      return <p>todo - need to handle this (direct request)</p>;
    }

    const constructSelected = !!constructId;

    return (
      <div className="ProjectPage">
        <Inventory />

        <div className="ProjectPage-content">
          <ProjectHeader project={project}/>

          <div className="ProjectPage-constructs">

            {/* if viewing specific construct, let routing take over*//* if viewing specific construct, let routing take over*/}
            {constructSelected && children}

            {/* otherwise, show all the constructs... *//* otherwise, show all the constructs... */}
            {!constructSelected && constructs.map(construct => {
              return (
                <div key={construct.id}>
                  <h3>Construct {construct.metadata.name}</h3>

                  <SketchConstruct construct={construct}/>
                </div>
              );
            })}
          </div>

          <ProjectDetailView project={project}/>
        </div>

        <Inspector />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { projectId, constructId } = state.router.params;
  const project = state.projects[projectId];
  const constructs = project.components.map(componentId => state.blocks[componentId]);

  return {
    projectId,
    constructId,
    project,
    constructs,
  };
}

export default connect(mapStateToProps, {
  pushState,
})(ProjectPage);
