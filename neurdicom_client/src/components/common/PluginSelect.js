import React, {Component} from 'react';
import {Dropdown} from "semantic-ui-react";
import PluginsService from "../../services/PluginsService";

class PluginSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            plugins: [],
            currentPluginId: -1
        };
        this.setState = this.setState.bind(this);
    }

    componentDidMount() {
        PluginsService.findPlugins(plugins => {
            plugins = plugins.map((plugin, index, array) => {
                return {
                    key: plugin.id,
                    value: plugin.id,
                    text: `${plugin.name} - ${plugin.info}`
                }
            });
            this.setState({plugins: plugins})
        });
    }

    handlePluginSelection(name, value) {
        this.setState({currentPluginId: parseInt(value)});
    }

    render() {
        const plugins = this.state.plugins;
        return (
            <Dropdown placeholder='Select Plugin' fluid search selection options={plugins}/>
        )
    }
}

export default PluginSelect;