import React, {Component} from 'react';
import MenuContainer from "../components/common/MenuContainer.component";
import {Button, Grid, Header, Icon, Image, Menu, Message, Modal, Popup, Segment} from "semantic-ui-react";
// import * as cornerstone from 'cornerstone-core';
import DicomService from "../services/DicomService";
import {Link} from "react-router-dom";

class SeriesViewerPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            instances: [],
            seriesId: props.match.params.id,
            currentInstanceTags: {},
            currentInstanceId: 0,
            tagsModalVisible: false
        };
        this.setState = this.setState.bind(this);
        this.prevInstance = this.prevInstance.bind(this);
        this.nextInstance = this.nextInstance.bind(this);
        this.showTags = this.showTags.bind(this);
    }

    componentWillMount() {
        console.log('WILL MOUNT');
        const seriesId = this.state.seriesId;
        DicomService.findInstancesBySeriesId(seriesId, instances => {
            this.setState({instances: instances});
        });
    }

    prevInstance() {
        const currentInstanceId = this.state.currentInstanceId;
        const instancesCount = (this.state.instances || []).length;
        if (instancesCount === 0)
            return;
        if (currentInstanceId === 0)
            this.setState({currentInstanceId: instancesCount - 1});
        else
            this.setState({currentInstanceId: currentInstanceId - 1});
    }

    nextInstance() {
        const currentInstanceId = this.state.currentInstanceId;
        const instancesCount = (this.state.instances || []).length;
        if (instancesCount === 0)
            return;
        if (currentInstanceId + 1 === instancesCount)
            this.setState({currentInstanceId: 0});
        else
            this.setState({currentInstanceId: currentInstanceId + 1});
    }

    showTags() {
        const instances = this.state.instances;
        if (instances) {
            const instanceId = instances[this.state.currentInstanceId]['id'];
            DicomService.findTagsByInstanceId(instanceId, tags => {
                this.setState({currentInstanceTags: tags});
            });
        }
    }

    render() {
        const instances = this.state.instances;
        const seriesId = this.state.seriesId;
        const currentInstanceId = this.state.currentInstanceId;
        const tagsModalVisible = this.state.tagsModalVisible;
        const currentInstanceTags = this.state.currentInstanceTags;
        console.log(currentInstanceId);
        return (
            <div style={{background: 'black'}}>
                <Menu inverted style={{borderRadius: '0px', marginBottom: '0px'}}>
                    <Menu.Item>
                        <Button icon inverted onClick={() => {
                            this.props.history.push('/studies')
                        }}>
                            <Icon name={'home'}/>
                        </Button>
                    </Menu.Item>
                    <Menu.Item>
                        <Button icon inverted onClick={this.prevInstance}>
                            <Icon name={'arrow left'}/>
                        </Button>
                    </Menu.Item>
                    <Menu.Item>
                        <Modal trigger={
                            <Button icon inverted onClick={this.showTags}>
                                <Icon name={'info circle'}/>
                            </Button>
                        }>
                            <Modal.Header> Instance {currentInstanceId + 1} Info</Modal.Header>
                            <Modal.Content>
                                {
                                    Object.keys(currentInstanceTags).map(tagName => {
                                        return (
                                            <div>
                                                <b>{tagName}:</b> {currentInstanceTags[tagName]}
                                            </div>
                                        )
                                    })
                                }
                            </Modal.Content>
                        </Modal>
                    </Menu.Item>
                    <Menu.Item position={'right'}>
                        <Button icon inverted onClick={this.nextInstance}>
                            <Icon name={'arrow right'}/>
                        </Button>
                    </Menu.Item>
                </Menu>
                {
                    (instances && (instances.length > 0)) && (
                        <div style={{background: 'black', maxHeight: '100%', paddingBottom: '0px'}}>
                            <Image src={`/api/instances/${instances[currentInstanceId]['id']}/image`} centered>

                            </Image>
                        </div>
                    )
                }
            </div>
        )
    }
}

export default SeriesViewerPage;