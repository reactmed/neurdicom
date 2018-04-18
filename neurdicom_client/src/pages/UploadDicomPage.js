import React, {Component} from 'react';
import {Button, Dimmer, Divider, Form, Grid, Header, Segment, Loader} from "semantic-ui-react";
import axios, {post} from 'axios';
import MenuContainer from "../components/common/MenuContainer";
import Dropzone from "react-dropzone";

class UploadDicomPage extends Component {
    constructor(props) {
        super(props);
        this.setState = this.setState.bind(this);
        this.state = {
            files: [],
            isPending: false
        }
    }

    addFile = (files) => {
        console.log(files);
        this.setState(
            {
                files: files
            }
        )
    };

    uploadFiles = () => {
        const files = this.state.files;
        if(files.length <= 0)
            return;
        const form = new FormData();
        for(let i = 0; i < files.length; i++){
            const file = files[i];
            form.append(`file${i}`, file, file.name);
        }
        const config = {
            headers: { 'content-type': 'multipart/form-data' }
        };
        axios.post('/api/instances/upload', form, config).then((resp) => {
            alert('All files uploaded!');
            this.setState({
                isPending: false
            });
        }).catch((resp) => {
            alert('Files could not uploaded!');
            this.setState({
                isPending: false
            });
        });
        this.setState({
            isPending: true
        });
    };

    render() {
        const files = this.state.files;
        const isPending = this.state.isPending;
        return (
            <div>
                <MenuContainer active={''}>
                    {
                        isPending ? (
                            <Dimmer>
                                <Loader>
                                    Files are uploading...
                                </Loader>
                            </Dimmer>
                        ) : (
                            <div/>
                        )
                    }
                    <Grid columns={'equal'}>
                        <Grid.Row>
                            <Grid.Column>
                                <Button onClick={this.uploadFiles} positive>Upload files</Button>
                            </Grid.Column>
                            <Grid.Column>
                                <Dropzone onDrop={this.addFile}>
                                    <p>Drop DICOM files here</p>
                                </Dropzone>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>

                    <Divider/>
                    {
                        files.map(file => {
                            return (
                                <Segment>
                                    <Header>
                                        {file.name}
                                    </Header>
                                </Segment>
                            )
                        })
                    }
                </MenuContainer>
            </div>
        )
    }
}

export default UploadDicomPage;