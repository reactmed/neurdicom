import React, {Component} from 'react';
import {Link} from "react-router-dom";
import {Button, Icon, Menu, Segment} from "semantic-ui-react";

class MenuContainer extends Component {
    constructor(props){
        super(props);
        this.setState = this.setState.bind(this);
        this.uploadDicomFile = this.uploadDicomFile.bind(this);
        this.uploadPlugin = this.uploadPlugin.bind(this);
        this.state = {
            isUploadDicomDialogVisible: false,
            isUploadPluginVisible: false
        }
    }

    uploadDicomFile(){

    }

    uploadPlugin(){

    }

    render() {
        return (
            <div>
                <Segment inverted style={{borderRadius: '0px'}}>
                    <Menu inverted pointing secondary>
                        <Menu.Item as={Link} to='/patients' name='patients'
                                   active={this.props.activeItem === 'patients'}/>
                        <Menu.Item as={Link} to='/studies' name='studies' active={this.props.activeItem === 'studies'}/>
                        <Menu.Item as={Link} to='/plugins' name='plugins' active={this.props.activeItem === 'plugins'}/>
                        <Menu.Item as={Link} to='/dicom_nodes' name='DICOM nodes'
                                   active={this.props.activeItem === 'DICOM nodes'}/>
                        <Menu.Item position='right'>
                            <Button as={Link} to={'/dicom/upload'} primary>Upload DICOM</Button>
                        </Menu.Item>
                        <Menu.Item>
                            <Button color={'red'}>
                                <Icon name={'shutdown'}/>
                                Log Out
                            </Button>
                        </Menu.Item>
                    </Menu>
                </Segment>
                <div style={{margin: '15px'}}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

MenuContainer.defaultProps = {
    activeItem: ''
};

export default MenuContainer;