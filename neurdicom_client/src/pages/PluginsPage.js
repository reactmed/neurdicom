import MenuContainer from "../components/common/MenuContainer";
import React, {Component} from "react";
import PluginsService from "../services/PluginsService";
import {Button, Divider, Dropdown, Form, Header, Message, Segment, Select} from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css';
import PluginItem from "../components/pluginsPage/PluginItem";
import * as axios from 'axios';

const patientMatcherOptions = [
    {key: 'EXACT', text: 'Exact equals', value: 'EXACT'},
    {key: 'STARTS_WITH', text: 'Starts with', value: 'STARTS_WITH'},
    {key: 'ENDS_WITH', text: 'Ends with', value: 'ENDS_WITH'},
    {key: 'FUZZY', text: 'Fuzzy matching', value: 'FUZZY'},
];
const options = [
    {key: 'DX', text: 'DX (Digital Radiography)', value: 'DX'},
    {key: 'MR', text: 'MR (Magnetic Resonance)', value: 'MR'},
    {key: 'CT', text: 'CT (Computer Tomography)', value: 'CT'},
    {key: 'US', text: 'US (Ultrasound)', value: 'US'},
    {key: 'ECG', text: 'ECG (Electrocardiography)', value: 'ECG'},
    {key: 'XA', text: 'XA (X-Ray)', value: 'XA'},
    {key: 'OT', text: 'OT (Other)', value: 'OT'},
];

class PluginsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            plugins: []
        };
        this.setState = this.setState.bind(this);
    }

    componentWillMount = () => {
        PluginsService.findPlugins(plugins => {
            this.setState({plugins: plugins});
        });
    };

    onDeletePlugin = (plugin) => {
        axios.delete(
            `/api/plugins/${plugin['id']}`
        ).then((response) => {
            PluginsService.findPlugins(plugins => {
                this.setState({plugins: plugins});
            });
        }).catch((err) => {
            alert(`Plugin "${plugin['display_name']}" could not uninstalled!`);
        })
    };

    onInstallPlugin = (plugin) => {
        axios.post(
            `/api/plugins/${plugin['id']}/install`
        ).then((response) => {
            PluginsService.findPlugins(plugins => {
                this.setState({plugins: plugins});
            });
        }).catch((err) => {
            alert(`Plugin "${plugin['display_name']}" could not installed!`);
            this.setState({});
        })
    };

    render() {
        console.log(this.state.plugins);
        if (this.state.plugins && this.state.plugins.length > 0) {
            return (
                <MenuContainer activeItem='plugins'>
                    <div style={{margin: '30px'}}>
                        <Form style={{marginBottom: '40px'}}>
                            <Form.Group widths='equal'>
                                <Form.Input
                                    label='Plugin Name'
                                    action={<Dropdown button basic floating options={patientMatcherOptions}
                                                      defaultValue='EXACT'/>}
                                    icon='search'
                                    iconPosition='left'
                                    placeholder='Plugin Name'
                                />
                                <Form.Input
                                    label='Author Name'
                                    action={<Dropdown button basic floating options={patientMatcherOptions}
                                                      defaultValue='EXACT'/>}
                                    icon='search'
                                    iconPosition='left'
                                    placeholder='Plugin Author'
                                />
                            </Form.Group>
                        </Form>
                        {
                            this.state.plugins.map(plugin => {
                                return (
                                    <PluginItem plugin={plugin} onDeletePlugin={this.onDeletePlugin}
                                                onInstallPlugin={this.onInstallPlugin}/>
                                )
                            })
                        }
                    </div>
                </MenuContainer>
            )
        }
        else {
            return (
                <MenuContainer activeItem='plugins'>
                    <Message warning header='Not plugins!' content='Not plugins found. You can add new plugin.'/>
                </MenuContainer>
            )
        }
    }
}

export default PluginsPage;