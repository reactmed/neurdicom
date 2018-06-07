import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Dropdown, Form, Modal} from "semantic-ui-react";
import './Dialog.css';
import Dropzone from "react-dropzone";
import * as nifti from 'nifti-reader-js';

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

    addGroundTruth = (files) => {
        // console.log(files[0]);
        // const file = files[0];
        // const reader = new FileReader();
        // reader.addEventListener('loadend', (res) => {
        //    const gtFile = res.target.result;
        //     console.log('COMPRESSED');
        //     const data = nifti.decompress(gtFile);
        //     const header = nifti.readHeader(data);
        //     const img = nifti.readImage(header, data);
        //     console.log(img);
        // });
        // reader.readAsArrayBuffer(file);
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
                                const range = param['range'];
                                const step = param['step'];
                                const type = param['type'];
                                const values = param['values'];
                                const _default = param['default'];
                                if (isRequired) {
                                    return (
                                        <Form.Field required>
                                            <label>{displayName}</label>
                                            <input name={paramName} key={paramName} value={this.state.params[paramName]}
                                                   onChange={this.onChange}/>
                                        </Form.Field>
                                    );
                                }
                                if (range && range.length === 2) {
                                    return (
                                        <Form.Field>
                                            <label>{displayName}</label>
                                            <input style={{width: '100%'}} type={'range'} name={paramName}
                                                   key={paramName}
                                                   min={range[0]}
                                                   max={range[1]}
                                                   step={step || 5.0}
                                                   value={this.state.params[paramName]}
                                                   onChange={this.onChange}/>
                                        </Form.Field>
                                    );
                                }
                                // if (values) {
                                //     const options = Object.keys(values).map(key => {
                                //         return {"key": key, "value": key, "text": values[key]};
                                //     });
                                //     return (
                                //         <Form.Field>
                                //             <label>{displayName}</label>
                                //             <Dropdown button basic floating options={options}
                                //                       defaultValue={_default} onChange={this.onChange}/>
                                //         </Form.Field>
                                //
                                //     )
                                // }
                                return (
                                    <Form.Field>
                                        <label>{displayName}</label>
                                        <input name={paramName} key={paramName} value={this.state.params[paramName]}
                                               onChange={this.onChange}/>
                                    </Form.Field>
                                );
                            })
                        }
                        <Dropzone onDrop={this.addGroundTruth}>
                            <p>Перетащите файлы сегментации</p>
                        </Dropzone>
                        <Button type={'button'} onClick={this.onApplyCallback} positive>Применить</Button>
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