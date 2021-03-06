import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import MenuItem from './MenuItem';
import MenuSeparator from './MenuSeparator';

/**
 * PopupMenu represents a rectangular menu or submenu drawn as a part of the
 * ToolbarMenu.
 *
 * Properties:
 *
 * {bool} open - True, if the PopupMenu is open/visible.
 * {function} closePopup - A function to close the PopupMenu
 * {array} menuItems - An array of MenuItems to be displayed in the PopupMenu
 * {object} position - Position at which the popup menu will be drawn.
 */

export default class PopupMenu extends Component {

  static propTypes = {
    open: PropTypes.bool.isRequired,
    closePopup: PropTypes.func.isRequired,
    menuItems: PropTypes.array.isRequired,
    position: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.listener = window.addEventListener('resize', (evt) => {
      this.props.closePopup();
    });
  }

  /**
   * Closes the menu on mouse down outside the menu.
   * @param {MouseEvent} click event
   */
  onMouseDown(evt) {
    const blockEl = ReactDOM.findDOMNode(this.refs.blocker);
    if (evt.target === blockEl) {
      this.props.closePopup();
    }
  }

  render() {
    const position = {
      left: `${this.props.position.x}px`,
      top: `${this.props.position.y}px`,
    };
    return (
      <div
        onMouseDown={this.onMouseDown.bind(this)}
        className={this.props.open ? 'menu-popup-blocker-visible' : 'menu-popup-blocker-hidden'}
        style={{}}
        ref="blocker"
      >
        <div className="menu-popup-container" style={position}>
          {this.props.menuItems.map((item, index) => {
            const boundAction = (evt) => {
              this.props.closePopup();
              if (item.action) {
                item.action(evt);
              }
            };
            return (
              item.text ?
              (<MenuItem
                key={item.key}
                disabled={item.disabled}
                classes={item.classes}
                text={item.text}
                action={boundAction}
                type={item.type}
                checked={item.checked}/>) :
              (<MenuSeparator key={index}/>)
            );
          })}
        </div>
      </div>
    );
  }
}
