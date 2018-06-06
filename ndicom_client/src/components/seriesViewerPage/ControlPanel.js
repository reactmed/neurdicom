import React, {Component} from 'react';
import {Button, Dropdown, Icon, Menu, Modal} from "semantic-ui-react";
import PropTypes from 'prop-types';
import PluginsService from "../../services/PluginsService";

const filterOptions = [
    {
        'key': 'sobel',
        'value': 'sobel',
        'text': 'Оператор Собеля'
    },
    {
        'key': 'sharpen',
        'value': 'sharpen',
        'text': 'Резкость'
    },
    {
        'key': 'emboss',
        'value': 'emboss',
        'text': 'Тиснение'
    },
    {
        'key': 'laplacian',
        'value': 'laplacian',
        'text': 'Оператор Лапласа'
    }
];
const colorScaleOptions = [
    {
        'key': 'main',
        'value': 'main',
        'text': 'Исходное изображение'
    },
    {
        'key': 'heatmap',
        'value': 'heatmap',
        'text': 'Тепловая схема'
    },
    {
        'key': 'inverseHeatmap',
        'value': 'inverseHeatmap',
        'text': 'Инвертированная тепловая схема'
    },
    {
        'key': 'hotRed',
        'value': 'hotRed',
        'text': 'Красная схема'
    },
    {
        'key': 'hotGreen',
        'value': 'hotGreen',
        'text': 'Зеленая схема'
    },
    {
        'key': 'hotBlue',
        'value': 'hotBlue',
        'text': 'Синяя схема'
    },
    {
        'key': 'inverse',
        'value': 'inverse',
        'text': 'Инвертирование'
    }
];

const viewModeOptions = [
    {
        'key': 'one',
        'value': 'one',
        'text': 'Один снимок'
    },
    {
        'key': 'two',
        'value': 'two',
        'text': 'Два снимка'
    }
];

class ControlPanel extends Component {
    constructor(props) {
        super(props);
        this.onHome = this.props.onHome || function () {
        };
        this.onNextInstance = this.props.onNextInstance || function () {
        };
        this.onPrevInstance = this.props.onPrevInstance || function () {
        };
        this.onPlay = this.props.onPlay || function () {
        };
        this.onStop = this.props.onStop || function () {
        };
        this.onSetColorScale = this.props.onSetColorScale || function () {
        };
        this.onSetViewMode = this.props.onSetViewMode || function () {
        };
        this.onRotateLeft = this.props.onRotateLeft || function () {
        };
        this.onRotateRight = this.props.onRotateRight || function () {
        };
        this.onApplyPlugin = this.props.onApplyPlugin || function () {
        };
        this.setState = this.setState.bind(this);
        this.state = {
            pluginOptions: [],
            pluginId: null
        }
    }

    componentDidMount = () => {
        PluginsService.findPlugins((plugins) => {
            console.log(plugins);
            const pluginOptions = plugins.filter(plugin => plugin['is_installed'])
                .map(plugin => {
                        return {key: plugin.id, value: plugin.id, text: plugin['display_name']};
                    }
                );
            this.setState({pluginOptions: pluginOptions})
        });
    }

    onSelectPlugin = (e, o) => {
        // this.setState({
        //     pluginId: o.value
        // });
    };

    onApplyPluginCallback = (e, o) => {
        const onApplyPlugin = this.onApplyPlugin;
        const pluginId = o.value;
        if(pluginId) {
            onApplyPlugin(pluginId);
        }
    };

    render = () => {
        const pluginOptions = this.state.pluginOptions;
        return (
            <Menu inverted style={{borderRadius: '0px', marginBottom: '0px'}}>
                <Menu.Item>
                    <Button size={'small'} icon inverted onClick={this.onHome}>
                        <Icon name={'home'}/>
                    </Button>
                </Menu.Item>
                <Menu.Item>
                    <Button icon inverted onClick={this.onPrevInstance}>
                        <Icon name={'arrow left'}/>
                    </Button>
                </Menu.Item>
                <Menu.Item>
                    <Button icon inverted onClick={this.onPlay}>
                        <Icon name={'play'}/>
                    </Button>
                </Menu.Item>
                <Menu.Item>
                    <Button icon inverted onClick={this.onStop}>
                        <Icon name={'stop'}/>
                    </Button>
                </Menu.Item>
                <Menu.Item>
                    <Dropdown placeholder='Цветовая схема' fluid search selection options={colorScaleOptions}
                              onChange={this.onSetColorScale}/>
                </Menu.Item>
                <Menu.Item>
                    <Dropdown placeholder='Фильтры' fluid search selection options={filterOptions} onChange={this.onSetColorScale}/>
                </Menu.Item>
                <Menu.Item>
                    <Dropdown placeholder='Режим просмотра' fluid search selection options={viewModeOptions}
                              onChange={this.onSetViewMode}/>
                </Menu.Item>
                <Menu.Item>
                    <Button icon inverted>
                        <Icon name={'sun'}/>
                    </Button>
                </Menu.Item>
                <Menu.Item>
                    <Button icon inverted>
                        <Icon name={'zoom'}/>
                    </Button>
                </Menu.Item>
                <Menu.Item>
                    <Button icon inverted onClick={this.onRotateLeft}>
                        <Icon name={'redo'}/>
                    </Button>
                </Menu.Item>
                <Menu.Item>
                    <Button icon inverted onClick={this.onRotateRight}>
                        <Icon name={'undo'}/>
                    </Button>
                </Menu.Item>
                <Menu.Item position={'right'}>
                    <Dropdown ref={ref => this.pluginSelect} placeholder='Плагин' fluid search selection
                              options={pluginOptions} onChange={this.onApplyPluginCallback}
                    />
                </Menu.Item>
                <Menu.Item position={'right'}>
                    <Button icon inverted onClick={this.onNextInstance}>
                        <Icon name={'arrow right'}/>
                    </Button>
                </Menu.Item>
            </Menu>
        );
    }
}

ControlPanel.propTypes = {
    onHome: PropTypes.func,
    onPrevInstance: PropTypes.func,
    onNextInstance: PropTypes.func,
    onPlay: PropTypes.func,
    onStop: PropTypes.func,
    onSetColorScale: PropTypes.func,
    onSetViewMode: PropTypes.func,
    onRotateLeft: PropTypes.func,
    onRotateRight: PropTypes.func,
    onApplyPlugin: PropTypes.func
};

export default ControlPanel;