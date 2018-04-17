import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Form, Modal} from "semantic-ui-react";
import './Dialog.css';

class BlendParamsDialog extends Component {
    constructor(props) {
        super(props);
        this.onClose = this.props.onClose || function () {

        };
        this.onApply = this.props.onApply || function () {

        };
        this.state = {
            params: {
                alpha: 0.5
            }
        };
    }

    onApplyCallback = () => {
        const onApply = this.onApply;
        const params = this.state.params;
        const onClose = this.onClose;
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
        const isOpen = this.props.open;
        return (
            <Modal open={isOpen} onClose={this.onClose}>
                <Modal.Header>
                    Blend
                </Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <label>Alpha</label>
                            <input name={'alpha'} key={'alpha'} value={this.state.params['alpha']}
                                               onChange={this.onChange}/>
                        </Form.Field>
                        <Button type={'button'} onClick={this.onApplyCallback} positive>Apply</Button>
                    </Form>
                </Modal.Content>
            </Modal>
        )
    }
}

BlendParamsDialog.prototypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onApply: PropTypes.func
};

export default BlendParamsDialog;