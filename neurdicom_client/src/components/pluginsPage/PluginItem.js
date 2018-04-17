import React, {Component} from 'react';
import {Button, Divider, Header, Loader, Segment} from "semantic-ui-react";
import PropTypes from 'prop-types';

class PluginItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isInstalling: false
        };
        this.setState = this.setState.bind(this);
    }

    onDeletePlugin = () => {
        const plugin = this.props.plugin;
        const callback = this.props.onDeletePlugin;
        callback(plugin);
    };

    onInstallPlugin = () => {
        const plugin = this.props.plugin;
        const callback = this.props.onInstallPlugin;
        callback(plugin);
        this.setState({isInstalling: true});
    };

    render() {
        const plugin = this.props.plugin;
        return (
            <Segment>
                <Header as='h1'>{plugin['display_name']}
                </Header>
                <b>Author: </b>{plugin['author']}
                <br/>
                <b>Version: </b>{plugin['version']}
                <br/>
                <b>Tags: </b>{plugin['tags'].join(', ')}
                <br/>
                <b>Modalities: </b>{plugin['modalities'].join(', ')}
                <Divider/>
                <div style={{textAlign: 'right'}}>
                    {
                        plugin['is_installed'] ? (
                            <Button color={'red'} onClick={this.onDeletePlugin}>
                                Delete
                            </Button>
                        ) : (
                            <Button color={'green'} onClick={this.onInstallPlugin}>
                                Install
                            </Button>
                        )
                    }
                </div>
            </Segment>
        );
    }
}

PluginItem.propTypes = {
    plugin: PropTypes.object,
    onDeletePlugin: PropTypes.func,
    onInstallPlugin: PropTypes.func,
    isInstalling: PropTypes.bool
};

export default PluginItem;