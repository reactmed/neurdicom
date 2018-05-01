import React, {Component} from 'react';
import DicomService from "../services/DicomService";
import PluginsService from "../services/PluginsService";
import ControlPanel from "../components/processingPage/ControlPanel";
import DicomViewer from "../components/processingPage/DicomViewer";
import ParamsDialog from "../components/processingPage/ParamsDialog";
import BlendParamsDialog from '../components/processingPage/BlendParamsDialog';
import * as axios from 'axios';
import {Dimmer, Loader} from "semantic-ui-react";


class ProcessingPage extends Component {
    constructor(props) {
        super(props);
        this.instanceId = this.props.match.params.instanceId;
        this.pluginId = this.props.match.params.pluginId;
        this.state = {
            plugin: null,
            instance: null,
            original: null,
            mask: null,
            colorScale: 'main',
            dialogOpen: false,
            isApplied: false,
            mode: 'blend',
            alpha: 0.5,
            isPending: false
        };
        this.setState = this.setState.bind(this);
    }

    componentWillMount() {
        DicomService.findInstancesById(this.instanceId, (instance) => {
            PluginsService.findPluginById((plugin) => {
                axios.get(`/api/instances/${instance['id']}/raw`, {responseType: 'blob'})
                    .then((resp) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const original = new Uint8Array(e.target.result);
                            this.setState({
                                instance: instance,
                                plugin: plugin,
                                original: original
                            });
                        };
                        reader.readAsArrayBuffer(resp.data);
                    });
            }, this.pluginId);
        });
    }

    onHome = () => {
        const instance = this.state.instance;
        console.log(instance);
        this.props.history.push(`/series/${instance['parent']['series']['id']}`);
    };

    setColorScale = (e, d) => {
        this.setState({colorScale: d.value})
    };

    onSetAlpha = (e) => {
        let alpha = e.target.value;
        this.setState({
            alpha: alpha
        })
    };

    onSetMode = (e, o) => {
        this.setState({mode: o.value});
    };

    onOpenDialog = () => {
        console.log('OPEN DIALOG');
        this.setState({dialogOpen: true});
    };

    onCloseDialog = () => {
        this.setState({dialogOpen: false});
    };

    onApply = (params) => {
        const instanceId = this.state.instance['id'];
        const pluginId = this.state.plugin['id'];
        console.log(params);
        axios.post(
            `/api/instances/${instanceId}/process/by_plugin/${pluginId}`,
            JSON.stringify(params),
            {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/octet-stream'
                }
            }
        ).then((resp) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const mask = new Uint8Array(e.target.result);
                this.setState({
                    mask: mask,
                    isPending: false
                });
            };
            reader.readAsArrayBuffer(resp.data);
        }).catch((resp) => {
            alert('Error in processing!');
            this.setState({
                isPending: false
            });
        });
        console.log('IS PENDING');
        this.setState({
            isPending: true
        })
    };

    render() {
        const instance = this.state.instance;
        const plugin = this.state.plugin;
        const original = this.state.original;
        const mode = this.state.mode;
        const mask = this.state.mask;
        let alpha = this.state.alpha;
        const isPending = this.state.isPending;
        if (alpha === undefined || alpha === null || alpha === '')
            alpha = 0.5;
        alpha = parseFloat(alpha);
        const colorScale = this.state.colorScale;
        if (instance && plugin) {
            const viewerProps = {
                style: {
                    height: window.innerHeight
                },
                instance: instance,
                colorScale: colorScale,
                original: original,
                mode: mode,
                mask: mask,
                alpha: alpha
            };
            if (isPending) {
                return (
                    <div style={{
                        background: 'black'
                    }}>


                        <ControlPanel onHome={this.onHome} onSetColorScale={this.setColorScale}
                                      onApplyPlugin={this.onOpenDialog} onSetMode={this.onSetMode}
                                      onSetAlpha={this.onSetAlpha} alpha={this.state.alpha}/>
                        <Dimmer active>
                            <Loader active>
                                Processing takes some time...
                            </Loader>
                        </Dimmer>
                        <DicomViewer {...viewerProps}/>
                        <ParamsDialog plugin={plugin}
                                      open={this.state.dialogOpen}
                                      onClose={this.onCloseDialog}
                                      onApply={this.onApply}/>

                    </div>
                );
            }
            else {
                return (
                    <div style={{
                        background: 'black'
                    }}>
                        <ControlPanel onHome={this.onHome} onSetColorScale={this.setColorScale}
                                      onApplyPlugin={this.onOpenDialog} onSetMode={this.onSetMode}
                                      onSetAlpha={this.onSetAlpha} alpha={this.state.alpha}/>
                        <DicomViewer {...viewerProps}/>
                        <ParamsDialog plugin={plugin}
                                      open={this.state.dialogOpen}
                                      onClose={this.onCloseDialog}
                                      onApply={this.onApply}/>
                    </div>
                );
            }

        }
        else {
            return (
                <div style={{
                    background: 'black'
                }}>
                    <ControlPanel onHome={this.onHome} onSetColorScale={this.setColorScale}
                                  onApplyPlugin={this.onOpenDialog} onSetAlpha={this.onSetAlpha}
                                  onSetMode={this.onSetMode}/>
                </div>
            );
        }
    }
}

export default ProcessingPage;