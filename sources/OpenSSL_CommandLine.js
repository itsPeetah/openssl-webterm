import React from "react";
import WasmWebTerm from "wasm-webterm";
import XTerm from "./xterm-for-react";
import OpenSSLGUI from "./openssl-gui/OpenSSL_GUI";

class CommandLine extends React.Component {
  wasmTerm;

  constructor(props) {
    super(props);

    window.commandLine = this; // todo: debug

    // init wasm xterm addon (try cto url first)
    const baseUrl = window.CTO_Globals?.pluginRoot || "./";
    this.wasmTerm = new WasmWebTerm(baseUrl + "bin");

    // register api handlers for addon interaction
    this.wasmTerm.onFileSystemUpdate = (files) => this.setFiles(files);
    this.wasmTerm.onBeforeCommandRun = () => {
      if (!this.wasmTerm._worker)
        return new Promise(
          (
            resolve // using promise + timeout to show
          ) => {
            this.setLoading("executing command", () =>
              setTimeout(() => resolve(), 20)
            );
          }
        );
    }; // the animation before gui freezes ^^
    this.wasmTerm.onCommandRunFinish = () => {
      if (!this.wasmTerm._worker) this.setLoading(false);
    };

    this.state = {
      loading: false,
      files: this.wasmTerm._wasmFsFiles,
    };

    // implement echo with js
    this.wasmTerm.registerJsCommand("echo", async function* (argv) {
      for (const char of argv.join(" ")) yield char;
    });
  }

  render() {
    return (
      <div className={"osslcmdline abovebelow"}>
        <div style={{ position: "relative", display: "none" }}>
          <XTerm
            addons={[this.wasmTerm]}
            options={{ fontSize: 15, fontFamily: "monospace" }}
          />
        </div>

        <OpenSSLGUI
          files={this.state.files}
          setFiles={(files) => this.setFiles(files)}
          runCommand={(line) => this.runCommandFromOpenSSLGUI(line)}
        />
      </div>
    );
  }

  componentDidUpdate(prevProps, prevState) {
    return true; // render anyway
  }

  setLoading(value, callback) {
    // value is string or boolean
    if (value) this.setState({ loading: value }, callback);
    else this.setState({ loading: false }, callback);
  }

  setFiles(files) {
    this.wasmTerm._wasmFsFiles = files;
    this.setState(() => ({ files: this.wasmTerm._wasmFsFiles }));
    // state is passed as a function to use latest reference to wasmFsFiles
  }

  async runCommandFromOpenSSLGUI(line) {
    // only run one command at a time
    if (this.wasmTerm._isRunningCommand) return;

    // show command on terminal
    this.wasmTerm._xterm.write(line + "\r\n");

    // abort current repl
    this.wasmTerm._xtermEcho.abortRead(
      "Everything is fine, running command from GUI"
    );

    // add command to history
    this.wasmTerm._xtermEcho.history.push(line);

    // show loading animation
    await this.wasmTerm.onBeforeCommandRun();

    // execute line of commands
    await this.wasmTerm.runLine(line);

    // print newline after
    this.wasmTerm._xterm.write("\r\n");

    // hide loading animation
    await this.wasmTerm.onCommandRunFinish();

    // restart repl
    this.wasmTerm.repl();
  }
}

export default CommandLine;
