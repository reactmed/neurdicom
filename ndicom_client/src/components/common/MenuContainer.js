import React, {Component} from 'react';
import {Link} from "react-router-dom";
import {connect} from 'react-redux';
import {Button, Dropdown, Icon, Menu, Segment} from "semantic-ui-react";
import {Translate, setActiveLanguage} from "react-localize-redux";

const languagesOptions = {
    'Русский': 'ru',
    'English': 'en'
};

class MenuContainer extends Component {
    constructor(props) {
        super(props);
        this.setState = this.setState.bind(this);
        this.changeLanguage = this.props.changeLanguage;
    }

    onChangeLanguage = (e) => {
        this.changeLanguage(languagesOptions[e.target.innerHTML]);
    };

    render() {
        return (
            <Translate>
                {
                    (translate) => {
                        return (
                            <div>
                                <Segment inverted style={{borderRadius: '0px'}}>
                                    <Menu inverted>
                                        <Menu.Item as={Link} to='/patients' name={translate('patient.patients')}
                                                   active={this.props.activeItem === 'patients'}/>
                                        <Menu.Item as={Link} to='/studies' name={translate('study.studies')}
                                                   active={this.props.activeItem === 'studies'}/>
                                        <Menu.Item as={Link} to='/plugins' name={translate('plugin.plugins')}
                                                   active={this.props.activeItem === 'plugins'}/>
                                        <Menu.Item as={Link} to='/dicom_nodes' name={translate('dicomNode.dicomNodes')}
                                                   active={this.props.activeItem === 'DICOM nodes'}/>
                                        <Menu.Menu position='right' inverted>
                                            <Dropdown position={'right'} item text={translate('translation.changeLanguage')}
                                                      inverted>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item
                                                        onClick={this.onChangeLanguage}>Русский</Dropdown.Item>
                                                    <Dropdown.Item
                                                        onClick={this.onChangeLanguage}>English</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </Menu.Menu>
                                        <Menu.Item position='right'>
                                            <Button as={Link} to={'/dicom/upload'}
                                                    primary>{translate('uploadDicom.uploadDicom')}</Button>
                                        </Menu.Item>
                                        <Menu.Item>
                                            <Button color={'red'}>
                                                <Icon name={'shutdown'}/>
                                                {translate('auth.logOut')}
                                            </Button>
                                        </Menu.Item>
                                    </Menu>
                                </Segment>
                                <div style={{margin: '15px'}}>
                                    {this.props.children}
                                </div>
                            </div>
                        );
                    }
                }
            </Translate>
        )
    }
}

MenuContainer.defaultProps = {
    activeItem: ''
};

const mapStateToProps = (state) => (
    {}
);

const mapDispatchToProps = (dispatch) => (
    {
        changeLanguage(languageCode) {
            console.log(languageCode);
            dispatch(setActiveLanguage(languageCode));
        }
    }
);

export default connect(mapStateToProps, mapDispatchToProps)(MenuContainer);