import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Form, Modal} from "semantic-ui-react";
import './Dialog.css';

class ParamsDialog extends Component {
    constructor(props) {
        super(props);
        this.onClose = this.props.onClose || function () {

        };
        this.onApply = this.props.onApply || function () {

        };
        this.setState = this.setState.bind(this);
        let params = {};
        Object.keys(this.props.plugin['params']).forEach(paramName => {
            params[paramName] = this.props.plugin['params'][paramName]['default'] || null;
        });
        this.state = {
            params: params
        };
    }

    onApplyCallback = () => {
        const onApply = this.onApply;
        const params = this.state.params;
        const onClose = this.onClose;
        Object.keys(params).forEach(paramName => {
            const pluginParam = this.props.plugin['params'][paramName];
            const type = pluginParam['type'];
            const isRequired = pluginParam['is_required'];
            const value = params[paramName];
            if ((value === null || value === undefined || value === '') && !isRequired)
                params[paramName] = null;
            else if (type === 'int')
                params[paramName] = parseInt(value);
            else if (type === 'float')
                params[paramName] = parseFloat(value);
        });
        onApply(params);
        onClose();
    };

    onChange = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        const params = this.state.params;
        params[name] = value;
        this.setState({
            params: params
        })
    };

    render() {
        const plugin = this.props.plugin;
        const isOpen = this.props.open;
        const params = plugin['params'];
        return (
            <Modal open={isOpen} onClose={this.onClose}>
                <Modal.Header>
                    {plugin['display_name']}
                </Modal.Header>
                <Modal.Content>
                    <Form>
                        {
                            Object.keys(params).map(paramName => {
                                const param = params[paramName];
                                const displayName = param['display_name'];
                                const isRequired = param['is_required'] || false;
                                if (isRequired) {
                                    return (
                                        <Form.Field required>
                                            <label>{displayName}</label>
                                            <input name={paramName} key={paramName} value={this.state.params[paramName]}
                                                   onChange={this.onChange}/>
                                        </Form.Field>
                                    );
                                }
                                return (
                                    <Form.Field>
                                        <label>{displayName}</label>
                                        <input name={paramName} key={paramName} value={this.state.params[paramName]}
                                               onChange={this.onChange}/>
                                    </Form.Field>
                                );
                            })
                        }
                        <Button type={'button'} onClick={this.onApplyCallback} positive>Apply</Button>
                    </Form>
                </Modal.Content>
            </Modal>
        )
    }
}

ParamsDialog.prototypes = {
    plugin: PropTypes.object,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onApply: PropTypes.func
};

export default ParamsDialog;