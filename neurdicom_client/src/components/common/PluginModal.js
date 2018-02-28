import React, {Component} from 'react';
import {Button, Icon, Modal} from "semantic-ui-react";
import PluginSelect from "./PluginSelect";

class PluginModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            instanceId: this.props.instanceId,
            currentPluginId: 0,
            isApplied: false,
            isChosen: false
        }
    }

    render() {
        const isChosen = this.state.isChosen;
        const isApplied = this.state.isApplied;
        return (
            <Modal centered trigger={
                <Button icon inverted>
                    <Icon name={'lab'}/>
                </Button>
            }>
                <Modal.Header>Apply Plugin To Image</Modal.Header>
                <Modal.Content>
                    <PluginSelect/>
                </Modal.Content>
            </Modal>
        );
    }
}

export default PluginModal;