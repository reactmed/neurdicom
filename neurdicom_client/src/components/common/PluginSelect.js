import React, {Component} from 'react';
import {Dropdown, Form} from "semantic-ui-react";
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
        const currentPluginId = this.state.currentPluginId;
        if (currentPluginId) {
            const plugin = plugins[currentPluginId];
            const paras = plugin.params;
            return (
                <div>
                    {/*<Dropdown onChange={this.handlePluginSelection} placeholder='Select Plugin' fluid search selection*/}
                              {/*options={plugins}/>*/}
                    {/*<Form>*/}
                        {/*{*/}

                        {/*}*/}
                        {/*<Form.Input*/}
                            {/*id='id_patient_name'*/}
                            {/*label='Patient Name'*/}
                            {/*action={<Dropdown id='id_patient_name_filter' button basic floating*/}
                                              {/*options={patientMatcherOptions}*/}
                                              {/*defaultValue='exact'/>}*/}
                            {/*icon='search'*/}
                            {/*name='patient_name'*/}
                            {/*iconPosition='left'*/}
                            {/*placeholder='Patient Name'*/}
                            {/*onKeyPress={this.handleFindInputOnChange}*/}
                        {/*/>*/}
                    {/*</Form>*/}
                </div>
            )
        }
        else {
            return (
                <Dropdown onChange={this.handlePluginSelection} placeholder='Select Plugin' fluid search selection
                          options={plugins}/>
            )
        }
    }
}

export default PluginSelect;