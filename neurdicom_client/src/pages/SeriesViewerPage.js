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
            const url = `/api/instances/${instances[index].id}/image`;
            const tags = this.state.instanceTags;
            const viewMode = this.state.viewMode;
            if (viewMode === 'one') {
                return (
                    <div style={{
                        background: 'black'
                    }} tabIndex={'0'} onKeyDown={(event) => this.onKeyPress(event)}>
                        <DicomControlPanel onHome={() => {
                            this.props.history.push('/studies')
                        }} onNextInstance={this.nextInstance} onPrevInstance={this.prevInstance}
                                           onSetColorScale={this.setColorScale} onRotateLeft={this.rotateLeft}
                                           onRotateRight={this.rotateRight} onSetViewMode={this.setViewMode}/>
                        <DicomViewer style={{height: window.innerHeight}} index={index} instances={instances} url={url}
                                     rotation={this.state.rotation}
                                     colorScale={this.state.colorScale} animation={this.state.animation}/>
                    </div>
                );
            }
            else if (viewMode === 'two') {
                const url1 = `/api/instances/${instances[index].id}/image`;
                const url2 = `/api/instances/${instances[(index + 1) % instances.length].id}/image`;
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
                                    <DicomViewer style={{height: window.innerHeight}} index={index}
                                                 instances={instances} url={url1}
                                                 rotation={this.state.rotation}
                                                 colorScale={this.state.colorScale} animation={this.state.animation}/>
                                </Grid.Column>
                                <Grid.Column>
                                    <DicomViewer style={{height: window.innerHeight}} index={index}
                                                 instances={instances} url={url2}
                                                 rotation={this.state.rotation}
                                                 colorScale={this.state.colorScale} animation={this.state.animation}/>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </div>
                );
            }
            else if (viewMode === 'four') {
                const url1 = `/api/instances/${instances[index].id}/image`;
                const url2 = `/api/instances/${instances[(index + 1) % instances.length].id}/image`;
                const url3 = `/api/instances/${instances[(index + 2) % instances.length].id}/image`;
                const url4 = `/api/instances/${instances[(index + 3) % instances.length].id}/image`;
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
                                    <DicomViewer style={{height: window.innerHeight / 2}} index={index}
                                                 instances={instances} url={url1}
                                                 rotation={this.state.rotation}
                                                 colorScale={this.state.colorScale} animation={this.state.animation}/>
                                </Grid.Column>
                                <Grid.Column>
                                    <DicomViewer style={{height: window.innerHeight / 2}} index={index}
                                                 instances={instances} url={url2}
                                                 rotation={this.state.rotation}
                                                 colorScale={this.state.colorScale} animation={this.state.animation}/>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column>
                                    <DicomViewer style={{height: window.innerHeight / 2}} index={index}
                                                 instances={instances} url={url3}
                                                 rotation={this.state.rotation}
                                                 colorScale={this.state.colorScale} animation={this.state.animation}/>
                                </Grid.Column>
                                <Grid.Column>
                                    <DicomViewer style={{height: window.innerHeight / 2}} index={index}
                                                 instances={instances} url={url4}
                                                 rotation={this.state.rotation}
                                                 colorScale={this.state.colorScale} animation={this.state.animation}/>
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