import React, {Component} from 'react';
import {
    Button, Icon, Menu, Modal
} from "semantic-ui-react";
import DicomService from "../services/DicomService";
import PluginModal from "../components/common/PluginModal";
import DicomViewer from "../components/common/DicomViewer";

class SeriesViewerPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            instances: [],
            seriesId: props.match.params.id,
            currentInstanceTags: {},
            instanceIndex: 0,
            currentInstance: {},
            tagsModalVisible: false,
            playTimerId: null,
            isLoaded: false,
            rotation: null
        };
        this.setState = this.setState.bind(this);
        this.prevInstance = this.prevInstance.bind(this);
        this.nextInstance = this.nextInstance.bind(this);
        this.showTags = this.showTags.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.play = this.play.bind(this);
        this.stop = this.stop.bind(this);
        this.rotateLeft = this.rotateLeft.bind(this);
        this.rotateRight = this.rotateRight.bind(this);
    }

    componentWillMount() {
        console.log('WILL MOUNT');
        const seriesId = this.state.seriesId;
        if (!this.state.isLoaded) {
            DicomService.findInstancesBySeriesId(seriesId, instances => {
                this.setState({instances: instances, isLoaded: true});
            });
        }
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
        const currentInstanceId = this.state.instanceIndex;
        const instancesCount = (this.state.instances || []).length;
        if (instancesCount === 0)
            return;
        if (currentInstanceId === 0) {
            this.setState({instanceIndex: instancesCount - 1, rotation: null});
        }
        else {
            this.setState({instanceIndex: currentInstanceId - 1, rotation: null});
        }
    }

    nextInstance() {
        const currentInstanceId = this.state.instanceIndex;
        const instancesCount = (this.state.instances || []).length;
        if (instancesCount === 0)
            return;
        if (currentInstanceId + 1 === instancesCount)
            this.setState({instanceIndex: 0, rotation: null});
        else
            this.setState({instanceIndex: currentInstanceId + 1, rotation: null});
    }

    showTags() {
        const instances = this.state.instances;
        if (instances) {
            const instanceId = instances[this.state.instanceIndex]['id'];
            DicomService.findTagsByInstanceId(instanceId, tags => {
                this.setState({currentInstanceTags: tags});
            });
        }
    }

    rotateLeft() {
        this.setState({rotation: 'left'});
    }

    rotateRight() {
        this.setState({rotation: 'right'});
    }

    render() {
        const instances = this.state.instances;
        if (instances && instances.length > 0) {
            const instanceIndex = this.state.instanceIndex;
            const url = `/api/instances/${instances[instanceIndex].id}/image`;
            const tags = this.state.currentInstanceTags;
            return (
                <div style={{
                    background: 'black'
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
                            <Button icon inverted onClick={this.rotateLeft}>
                                <Icon name={'redo'}/>
                            </Button>
                        </Menu.Item>
                        <Menu.Item>
                            <Button icon inverted onClick={this.rotateRight}>
                                <Icon name={'undo'}/>
                            </Button>
                        </Menu.Item>
                        <Menu.Item>
                            <Modal trigger={
                                <Button icon inverted onClick={this.showTags}>
                                    <Icon name={'info circle'}/>
                                </Button>
                            }>
                                <Modal.Header> Instance {instanceIndex + 1}</Modal.Header>
                                <Modal.Content>
                                    {
                                        Object.keys(tags).map(tagName => {
                                            const tagValue = tags[tagName];
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
                    <DicomViewer url={url} rotation={this.state.rotation}/>
                </div>
            );
        }
        else {
            return (
                <div style={{
                    background: 'black'
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
                            <Button icon inverted onClick={this.rotateLeft}>
                                <Icon name={'redo'}/>
                            </Button>
                        </Menu.Item>
                        <Menu.Item>
                            <Button icon inverted onClick={this.rotateRight}>
                                <Icon name={'undo'}/>
                            </Button>
                        </Menu.Item>
                        <Menu.Item position={'right'}>
                            <Button icon inverted onClick={this.nextInstance}>
                                <Icon name={'arrow right'}/>
                            </Button>
                        </Menu.Item>
                    </Menu>
                </div>
            );
        }
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