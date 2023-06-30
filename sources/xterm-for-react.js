/**
 * React wrapper for xterm.js
 * Taken from https://github.com/robert-harbison/xterm-for-react
 */

import * as React from "react";
import PropTypes from "prop-types";

import "xterm/css/xterm.css";

// We are using these as types.
// eslint-disable-next-line no-unused-vars
import { Terminal, ITerminalOptions, ITerminalAddon } from "xterm";

export default class Xterm extends React.Component {
  /**
   * The ref for the containing element.
   */
  terminalRef;

  /**
   * XTerm.js Terminal object.
   */
  terminal; // This is assigned in the setupTerminal() which is called from the constructor

  static propTypes = {
    className: PropTypes.string,
    options: PropTypes.object,
    addons: PropTypes.array,
  };

  constructor(props) {
    super(props);

    this.terminalRef = React.createRef();

    this.setupTerminal();
  }

  setupTerminal() {
    // Setup the XTerm terminal.
    this.terminal = new Terminal(this.props.options);

    // Load addons if the prop exists.
    if (this.props.addons) {
      this.props.addons.forEach((addon) => {
        this.terminal.loadAddon(addon);
      });
    }
  }

  componentDidMount() {
    if (this.terminalRef.current) {
      // Creates the terminal within the container element.
      this.terminal.open(this.terminalRef.current);
      //   window.terminal = terminal;
    }
  }

  componentWillUnmount() {
    // When the component unmounts dispose of the terminal and all of its listeners.
    this.terminal.dispose();
    // window.terminal = undefined;
  }

  render() {
    return <div className={this.props.className} ref={this.terminalRef} />;
  }
}
