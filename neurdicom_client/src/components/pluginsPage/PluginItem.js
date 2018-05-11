import React, {Component} from 'react';
import {Translate} from 'react-localize-redux';
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
            <Translate>
                {
                    (translate) => (
                        <Segment>
                            <Header as='h1'>{plugin['display_name']}
                            </Header>
                            <b>{translate('plugin.author')}: </b>{plugin['author']}
                            <br/>
                            <b>{translate('plugin.version')}: </b>{plugin['version']}
                            <br/>
                            <b>{translate('plugin.tags')}: </b>{plugin['tags'].join(', ')}
                            <br/>
                            <b>{translate('plugin.modalities')}: </b>{plugin['modalities'].join(', ')}
                            <Divider/>
                            <div style={{textAlign: 'right'}}>
                                {
                                    plugin['is_installed'] ? (
                                        <Button color={'red'} onClick={this.onDeletePlugin}>
                                            {translate('delete')}
                                        </Button>
                                    ) : (
                                        <Button color={'green'} onClick={this.onInstallPlugin}>
                                            {translate('install')}
                                        </Button>
                                    )
                                }
                            </div>
                        </Segment>
                    )
                }
            </Translate>

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