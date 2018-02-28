import React, {Component} from 'react';
import MenuContainer from "../components/common/MenuContainer.component";
import {
    Button, Container, Grid, Header, Icon, Image, Label, Menu, Message, Modal, Popup,
    Segment
} from "semantic-ui-react";
// import * as cornerstone from 'cornerstone-core';
import DicomService from "../services/DicomService";
import {Link} from "react-router-dom";
import ImagePanel from "../components/common/ImagePanel.component";
import PluginModal from "../components/common/PluginModal";

class SeriesViewerPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            instances: [],
            seriesId: props.match.params.id,
            currentInstanceTags: {},
            currentInstanceId: 0,
            currentInstance: {},
            tagsModalVisible: false,
            playTimerId: null
        };
        this.setState = this.setState.bind(this);
        this.prevInstance = this.prevInstance.bind(this);
        this.nextInstance = this.nextInstance.bind(this);
        this.showTags = this.showTags.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.play = this.play.bind(this);
        this.stop = this.stop.bind(this);
    }

    componentWillMount() {
        console.log('WILL MOUNT');
        const seriesId = this.state.seriesId;
        DicomService.findInstancesBySeriesId(seriesId, instances => {
            this.setState({instances: instances});
        });
    }

    play() {
        const playTimerId = setInterval(() => {
            this.nextInstance();
        }, 400);
        this.setState({playTimerId: playTimerId});
    }

    stop() {
        const playTimerId = this.state.playTimerId;
        clearInterval(playTimerId);
        this.setState({playTimerId: null});
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
            <div style={{
                maxWidth: '100%',
                maxHeight: '100%',
                overflow: 'auto'
            }} tabIndex={'0'} onKeyDown={(event) => this.onKeyPress(event)}>
                <Menu inverted style={{borderRadius: '0px', marginBottom: '0px'}}>
                    <Menu.Item>
                        <Button size={'small'} icon inverted onClick={() => {
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
                        <Button icon inverted onClick={this.play}>
                            <Icon name={'play'}/>
                        </Button>
                    </Menu.Item>
                    <Menu.Item>
                        <Button icon inverted onClick={this.stop}>
                            <Icon name={'stop'}/>
                        </Button>
                    </Menu.Item>
                    <Menu.Item>
                        <PluginModal/>
                    </Menu.Item>
                    <Menu.Item>
                        <Modal trigger={
                            <Button icon inverted onClick={this.showTags}>
                                <Icon name={'info circle'}/>
                            </Button>
                        }>
                            <Modal.Header> Instance {currentInstanceId + 1}</Modal.Header>
                            <Modal.Content>
                                {
                                    Object.keys(currentInstanceTags).map(tagName => {
                                        const tagValue = currentInstanceTags[tagName];
                                        if (typeof tagValue === 'object' && !Array.isArray(tagValue)) {
                                            return (
                                                <div>
                                                    <b>{tagName}:</b>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div>
                                                <b>{tagName}:</b> {tagValue}
                                            </div>
                                        );
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
                        <div style={{background: 'black'}}>
                            <Grid columns='equal'>
                                <Grid.Row>
                                    <Grid.Column width={2}>
                                        <b style={{color: 'yellow'}}>{`${instances[currentInstanceId].parent.patient['patient_name']}`}</b>
                                        <br/>
                                        <b style={{color: 'yellow'}}>{`${instances[currentInstanceId].parent.patient['patient_id']}`}</b>
                                        <br/>
                                        <b style={{color: 'yellow'}}>{`${instances[currentInstanceId].parent.study['study_date']}`}</b>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Image src={`/api/instances/${instances[currentInstanceId]['id']}/image`}
                                               centered/>
                                    </Grid.Column>
                                    <Grid.Column width={2}>
                                        <b style={{color: 'yellow'}}>{`Instance ${instances[currentInstanceId]['instance_number']}`}</b>
                                        <br/>
                                        <b style={{color: 'yellow'}}>{`${instances[currentInstanceId].parent.series['modality']}`}</b>
                                        <br/>
                                        <b style={{color: 'yellow'}}>{`${instances[currentInstanceId]['rows']}x${instances[currentInstanceId]['columns']}`}</b>
                                        <br/>
                                        <b style={{color: 'yellow'}}>{instances[currentInstanceId]['photometric_interpretation']}</b>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </div>
                    )
                }
            </div>
        )
    }

    onKeyPress(event) {
        console.log(event);
        if (event.key === 'ArrowLeft') {
            this.prevInstance();
        }
        else if (event.key === 'ArrowRight') {
            this.nextInstance();
        }
    }
}


export default SeriesViewerPage;