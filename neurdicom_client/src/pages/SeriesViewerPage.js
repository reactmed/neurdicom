import React, {Component} from 'react';
import {
    Button, Grid, Icon, Menu, Modal
} from "semantic-ui-react";
import DicomService from "../services/DicomService";
import DicomViewer from "../components/common/DicomViewer";
import Dropdown from "semantic-ui-react/dist/es/modules/Dropdown/Dropdown";
import DicomControlPanel from "../components/seriesViewerPage/DicomControlPanel";


class SeriesViewerPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            instances: [],
            seriesId: props.match.params.id,
            instanceTags: {},
            index: 0,
            instance: {},
            showTags: false,
            playTimerId: null,
            isLoaded: false,
            rotation: null,
            colorScale: 'main',
            animation: false,
            viewMode: 'one',
            animationId: undefined
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
        this.setColorScale = this.setColorScale.bind(this);
        this.setViewMode = this.setViewMode.bind(this);
    }

    componentWillMount() {
        const seriesId = this.state.seriesId;
        if (!this.state.isLoaded) {
            DicomService.findInstancesBySeriesId(seriesId, instances => {
                this.setState({instances: instances, isLoaded: true});
            });
        }
    }


    play() {
        if (!this.state.animationId) {
            const nextInstance = this.nextInstance;
            const state = this.state;
            const animate = (function () {
                if (!state.animation) {
                    console.log('ATOP');
                    return;
                }
                setTimeout(function () {
                    nextInstance();
                    state.animationId = requestAnimationFrame(animate);
                }, 1000 / 4)
            }).bind(this);
            state.animation = true;
            state.animationId = requestAnimationFrame(animate);
        }
    }

    stop() {
        if (this.state.animationId) {
            const state = this.state;
            state.animation = false;
            cancelAnimationFrame(state.animationId);
            state.animationId = undefined;
        }
    }

    prevInstance() {
        const currentInstanceId = this.state.index;
        const instancesCount = (this.state.instances || []).length;
        if (instancesCount === 0)
            return;
        if (currentInstanceId === 0) {
            this.setState({index: instancesCount - 1, rotation: null});
        }
        else {
            this.setState({index: currentInstanceId - 1, rotation: null});
        }
    }

    nextInstance() {
        const currentInstanceId = this.state.index;
        const instancesCount = (this.state.instances || []).length;
        if (instancesCount === 0)
            return;
        if (currentInstanceId + 1 === instancesCount)
            this.setState({index: 0, rotation: null});
        else
            this.setState({index: currentInstanceId + 1, rotation: null});
    }

    showTags() {
        const instances = this.state.instances;
        if (instances) {
            const instanceId = instances[this.state.index]['id'];
            DicomService.findTagsByInstanceId(instanceId, tags => {
                this.setState({instanceTags: tags});
            });
        }
    }

    rotateLeft() {
        this.setState({rotation: 'left'});
    }

    rotateRight() {
        this.setState({rotation: 'right'});
    }

    setColorScale(e, d) {
        this.setState({colorScale: d.value})
    }

    setViewMode(e, d) {
        this.setState({viewMode: d.value})
    }


    render() {
        const instances = this.state.instances;
        if (instances && instances.length > 0) {
            const index = this.state.index;
            const viewMode = this.state.viewMode;
            if (viewMode === 'one') {
                const viewerProps = {
                    style: {
                        height: window.innerHeight
                    },
                    instance: instances[index],
                    rotation: this.state.rotation,
                    colorScale: this.state.colorScale,
                };
                return (
                    <div style={{
                        background: 'black'
                    }} tabIndex={'0'} onKeyDown={(event) => this.onKeyPress(event)}>
                        <DicomControlPanel onHome={() => {
                            this.props.history.push('/studies')
                        }} onNextInstance={this.nextInstance} onPrevInstance={this.prevInstance}
                                           onSetColorScale={this.setColorScale} onRotateLeft={this.rotateLeft}
                                           onRotateRight={this.rotateRight} onSetViewMode={this.setViewMode}/>
                        <DicomViewer {...viewerProps}/>
                    </div>
                );
            }
            else if (viewMode === 'two') {
                const viewerProps = {
                    style: {
                        height: window.innerHeight
                    },
                    rotation: this.state.rotation,
                    colorScale: this.state.colorScale,
                };
                const instance1 = instances[index];
                const instance2 = instances[(index + 1) % instances.length];
                return (
                    <div style={{
                        background: 'black'
                    }} tabIndex={'0'} onKeyDown={(event) => this.onKeyPress(event)}>
                        <DicomControlPanel onHome={() => {
                            this.props.history.push('/studies')
                        }} onNextInstance={this.nextInstance} onPrevInstance={this.prevInstance}
                                           onSetColorScale={this.setColorScale} onRotateLeft={this.rotateLeft}
                                           onRotateRight={this.rotateRight} onSetViewMode={this.setViewMode}/>
                        <Grid columns={'equal'}>
                            <Grid.Row>
                                <Grid.Column>
                                    <DicomViewer instance={instance1} {...viewerProps}/>
                                </Grid.Column>
                                <Grid.Column>
                                    <DicomViewer instance={instance2} {...viewerProps}/>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </div>
                );
            }
        }
        else {
            return (
                <div style={{
                    background: 'black'
                }} tabIndex={'0'} onKeyDown={(event) => this.onKeyPress(event)}>
                    <DicomControlPanel onHome={() => {
                        this.props.history.push('/studies')
                    }} onNextInstance={this.nextInstance} onPrevInstance={this.prevInstance}
                                       onSetColorScale={this.setColorScale} onRotateLeft={this.rotateLeft}
                                       onRotateRight={this.rotateRight} onSetViewMode={this.setViewMode}/>
                </div>
            );
        }
    }

    onKeyPress(event) {
        if (event.key === 'ArrowLeft') {
            this.prevInstance();
        }
        else if (event.key === 'ArrowRight') {
            this.nextInstance();
        }
    }
}


export default SeriesViewerPage;