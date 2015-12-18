import React, { Component, PropTypes } from 'react';

import MenuItem from './MenuItem';
import MenuSeparator from './MenuSeparator';

export default class Menu extends Component {

  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    menuItems: PropTypes.array.isRequired,
  }

  toggle = (forceVal) => {
    this.props.onToggle(forceVal);
  }

  render() {
    return (
      <div className="menu-dropdown">
        <div className={this.props.isOpen ? 'menu-header menu-header-open' : 'menu-header'}
             onClick={this.toggle}>
          {this.props.title}
        </div>
        {this.props.isOpen && (
          <div className="menu-dropdown-container">
            {this.props.menuItems.map(item => {
              return (
                item.text ?
                  (<MenuItem text={item.text} action={item.action}/>) :
                  (<MenuSeparator />)
                );
            })}
          </div>
        )}
      </div>
    );
  }
}
