import React, {Component} from 'react';
import {Button, Dropdown, Icon, Menu, Modal, Form, Input, Label} from "semantic-ui-react";
import PropTypes from 'prop-types';
import PluginsService from "../../services/PluginsService";

const colorScaleOptions = [
    {
        'key': 'main',
        'value': 'main',
        'text': 'Исходное изображение'
    },
    {
        'key': 'heatmap',
        'value': 'heatmap',
        'text': 'Тепловая карта'
    },
    {
        'key': 'inverseHeatmap',
        'value': 'inverseHeatmap',
        'text': 'Инвертированная тепловая карта'
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
    },
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

const viewModeOptions = [
    {
        'key': 'main',
        'value': 'main',
        'text': 'Нет маски'
    },
    {
        'key': 'blend',
        'value': 'blend',
        'text': 'Смешивание'
    },
    {
        'key': 'mix',
        'value': 'mix',
        'text': 'Полное смешивание'
    },
    {
        'key': 'crop',
        'value': 'crop',
        'text': 'Вырезать фрагмент'
    },
    {
        'key': 'contour',
        'value': 'contour',
        'text': 'Контурное выделение'
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

    render() {
        return (
            <Menu inverted style={{borderRadius: '0px', marginBottom: '0px'}}>
                <Menu.Item>
                    <Button size={'small'} icon inverted onClick={this.onHome}>
                        <Icon name={'home'}/>
                    </Button>
                </Menu.Item>
                <Menu.Item>
                    <Dropdown placeholder='Фильтр' fluid search selection options={colorScaleOptions}
                              onChange={this.onSetColorScale}/>
                </Menu.Item>
                <Menu.Item>
                    <Dropdown placeholder='Режим просмотра' fluid search selection options={viewModeOptions}
                              onChange={this.onSetMode}/>
                </Menu.Item>
                <Menu.Item>
                    <Label inverted>Прозрачность</Label>
                    <Input type={'range'} min={'0'} max={'100'} name={'alpha'} key={'alpha'} value={this.props.alpha}
                                            onChange={this.onSetAlpha}/>
                </Menu.Item>
                <Menu.Item>
                    <Button primary onClick={this.onApplyPlugin}>
                        Применить плагин
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