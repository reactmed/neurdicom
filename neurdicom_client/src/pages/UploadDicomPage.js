import React, {Component} from 'react';
import {Button, Divider, Form} from "semantic-ui-react";
import axios, {post} from 'axios';
import MenuContainer from "../components/common/MenuContainer";

class UploadDicomPage extends Component {
    constructor(props) {
        super(props);
        this.setState = this.setState.bind(this);
        this.addFile = this.addFile.bind(this);
        this.uploadFiles = this.uploadFiles.bind(this);
    }

    addFile() {

    }

    uploadFiles() {

    }

    render() {
        return (
            <div>
                <MenuContainer active={''}>
                    <Button onClick={this.addFile}>Add file</Button>
                    <Button onClick={this.uploadFiles}>Upload files</Button>
                    <Divider/>

                </MenuContainer>
            </div>
        )
    }
}

export default UploadDicomPage;