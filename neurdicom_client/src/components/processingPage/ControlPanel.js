import React, {Component} from 'react';
import {Button, Dropdown, Icon, Menu, Modal, Form, Input, Label} from "semantic-ui-react";
import PropTypes from 'prop-types';
import PluginsService from "../../services/PluginsService";

const colorScaleOptions = [
    {
        'key': 'main',
        'value': 'main',
        'text': 'Original'
    },
    {
        'key': 'heatmap',
        'value': 'heatmap',
        'text': 'Heatmap'
    },
    {
        'key': 'inverseHeatmap',
        'value': 'inverseHeatmap',
        'text': 'Inverse Heatmap'
    },
    {
        'key': 'hotRed',
        'value': 'hotRed',
        'text': 'Hot Red'
    },
    {
        'key': 'hotGreen',
        'value': 'hotGreen',
        'text': 'Hot Green'
    },
    {
        'key': 'hotBlue',
        'value': 'hotBlue',
        'text': 'Hot Blue'
    },
    {
        'key': 'inverse',
        'value': 'inverse',
        'text': 'Inverse'
    },
    {
        'key': 'sobel',
        'value': 'sobel',
        'text': 'Sobel Operator'
    },
    {
        'key': 'sharpen',
        'value': 'sharpen',
        'text': 'Sharpen'
    },
    {
        'key': 'emboss',
        'value': 'emboss',
        'text': 'Emboss'
    },
    {
        'key': 'laplacian',
        'value': 'laplacian',
        'text': 'Laplacian'
    }
];

const viewModeOptions = [
    {
        'key': 'blend',
        'value': 'blend',
        'text': 'Blend'
    },
    {
        'key': 'crop',
        'value': 'crop',
        'text': 'Crop Segment'
    }
];

class ControlPanel extends Component {
    constructor(props) {
        super(props);
        this.onHome = this.props.onHome || function () {
        };
        this.onSetColorScale = this.props.onSetColorScale || function () {
        };
        this.onSetMode = this.props.onSetMode || function () {
        };
        this.onApplyPlugin = this.props.onApplyPlugin || function () {
        };
        this.onSetAlpha = this.props.onSetAlpha || function() {};
        this.setState = this.setState.bind(this);
    }

    onSetAlphaCallback = (e) => {
        const value = e.target.value;
        this.onSetAlpha(value);
    };

    render() {
        return (
            <Menu inverted style={{borderRadius: '0px', marginBottom: '0px'}}>
                <Menu.Item>
                    <Button size={'small'} icon inverted onClick={this.onHome}>
                        <Icon name={'home'}/>
                    </Button>
                </Menu.Item>
                <Menu.Item>
                    <Dropdown placeholder='Color scale' fluid search selection options={colorScaleOptions}
                              onChange={this.onSetColorScale}/>
                </Menu.Item>
                <Menu.Item>
                    <Dropdown placeholder='View Mode' fluid search selection options={viewModeOptions}
                              onChange={this.onSetMode}/>
                </Menu.Item>
                <Menu.Item>
                    <Label inverted>Alpha</Label>
                    <Input name={'alpha'} key={'alpha'} value={this.props.alpha}
                                            onChange={this.onSetAlpha}/>
                </Menu.Item>
                <Menu.Item>
                    <Button primary onClick={this.onApplyPlugin}>
                        Apply plugin
                    </Button>
                </Menu.Item>
            </Menu>
        );
    }
}

ControlPanel.propTypes = {
    onHome: PropTypes.func,
    onSetColorScale: PropTypes.func,
    onSetMode: PropTypes.func,
    onSetAlpha: PropTypes.func,
    onApplyPlugin: PropTypes.func,
    alpha: PropTypes.primary
};

export default ControlPanel;