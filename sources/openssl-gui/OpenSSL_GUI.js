import React from "react";
import Card from "react-bootstrap/Card";
import FilesTab from "./tabs/FilesTab";

class OpenSSLGUI extends React.Component {
  state = { filesdirty: false };

  shouldComponentUpdate(nextProps, nextState) {
    // checks if files have changed

    const prevPropsFileList = this.props.files.map((file) => file.name);
    const nextPropsFileList = nextProps.files.map((file) => file.name);

    const combinedFileList = prevPropsFileList.concat(
      nextPropsFileList.filter((file) => prevPropsFileList.indexOf(file) < 0)
    );

    for (const filename of combinedFileList) {
      if (!prevPropsFileList.includes(filename)) {
        console.log("file " + filename + " was newly created");
        nextState.filesdirty = true;
        break;
      } else if (!nextPropsFileList.includes(filename)) {
        console.log("file " + filename + " was deleted");
        nextState.filesdirty = true;
        break;
      } else {
        const prevFile = this.props.files.find((file) => file.name == filename);
        const nextFile = nextProps.files.find((file) => file.name == filename);

        if (prevFile.bytes.length != nextFile.bytes.length) {
          console.log("contents of " + filename + " have changed");
          nextState.filesdirty = true;
          break;
        }
      }
    }

    // todo: show in files tab which files have changed?

    return true; // update anyway
  }

  render() {
    return (
      <Card className="osslgui my-3">
        <FilesTab files={this.props.files} setFiles={this.props.setFiles} />
      </Card>
    );
  }

  onTabSelect(eventKey) {
    if (eventKey == "files") this.setState({ filesdirty: false });
  }
}

export default OpenSSLGUI;
