import React, {Component} from 'react';
import DicomService from "../services/DicomService";
import PluginsService from "../services/PluginsService";
import ControlPanel from "../components/processingPage/ControlPanel";
import DicomViewer from "../components/processingPage/DicomViewer";
import ParamsDialog from "../components/processingPage/ParamsDialog";
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
            mode: 'mix',
            alpha: 100,
            isPending: false,
            seedPoint: [-1, -1],
            params: null
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
        let alpha = Number(e.target.value);
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

    onSetSeedPoint = (uv) => {
        const params = this.state.params;
        const seedPoint = uv;
        if(params){
            const instance = this.state.instance;
            const instanceId = instance['id'];
            const pluginId = this.state.plugin['id'];
            const w = parseInt(instance['columns']);
            const h = parseInt(instance['rows']);
            params['seed_point'] = [
                Math.floor(seedPoint[0] * w),
                Math.floor((1.0 - seedPoint[1]) * h)
            ];
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
                    let count = mask.filter(v => v > 0).length;
                    console.log(count);
                    let pixelSize = parseFloat(instance['pixel_spacing'].split(', ')[0].replace('[', '').replace("'", ''));
                    let area = Math.sqrt(count) * pixelSize;
                    console.log(area);
                    // alert(`Опухоль имеет площадь ${area} mm^2`);
                    this.setState({
                        mask: mask,
                        isPending: false
                    });
                };
                reader.readAsArrayBuffer(resp.data);
            }).catch(() => {
                alert('Error in processing!');
                this.setState({
                    isPending: false
                });
            });
            console.log('IS PENDING');
            this.setState({
                isPending: true
            });
        }
        this.setState({
            seedPoint: uv
        });
    };

    onApply = (params) => {
        const instance = this.state.instance;
        const instanceId = instance['id'];
        const pluginId = this.state.plugin['id'];
        const w = parseInt(instance['columns']);
        const h = parseInt(instance['rows']);
        params['seed_point'] = [
            Math.floor(this.state.seedPoint[0] * w),
            Math.floor((1.0 - this.state.seedPoint[1]) * h)
        ];
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
                let count = mask.filter(v => v > 0).length;
                console.log(count);
                let pixelSize = parseFloat(instance['pixel_spacing'].split(', ')[0].replace('[', '').replace("'", ''));
                let area = Math.sqrt(count) * pixelSize;
                console.log(area);
                // alert(`Опухоль имеет площадь ${area} mm^2`);
                this.setState({
                    mask: mask,
                    isPending: false
                });
            };
            reader.readAsArrayBuffer(resp.data);
        }).catch(() => {
            alert('Error in processing!');
            this.setState({
                isPending: false
            });
        });
        console.log('IS PENDING');
        this.setState({
            isPending: true,
            params: params
        })
    };

    render() {
        const instance = this.state.instance;
        const plugin = this.state.plugin;
        const original = this.state.original;
        const mode = this.state.mode;
        const mask = this.state.mask;
        const seedPoint = this.state.seedPoint;
        let alpha = this.state.alpha;
        const isPending = this.state.isPending;
        if (alpha === undefined || alpha === null || alpha === '')
            alpha = 0.5;
        alpha = parseFloat(alpha);
        const colorScale = this.state.colorScale;
        console.log(seedPoint);
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
                alpha: alpha / 100.0,
                seedPoint: seedPoint,
                onMouseClick: this.onSetSeedPoint
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
                                Обработка займет несколько минут...
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