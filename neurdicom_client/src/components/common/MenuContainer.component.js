import React, {Component} from 'react';
import {Link} from "react-router-dom";
import {Button, Menu, Segment} from "semantic-ui-react";

class MenuContainer extends Component {
    render() {
        return (
            <div>
                <Segment inverted style={{borderRadius: '0px'}}>
                    <Menu inverted pointing secondary>
                        <Menu.Item as={Link} to='/patients' name='patients'
                                   active={this.props.activeItem === 'patients'}/>
                        <Menu.Item as={Link} to='/studies' name='studies' active={this.props.activeItem === 'studies'}/>
                        <Menu.Item as={Link} to='/plugins' name='plugins' active={this.props.activeItem === 'plugins'}/>
                        <Menu.Item position='right'>
                            <Button primary>Upload DICOM</Button>
                        </Menu.Item>
                        <Menu.Item>
                            <Button primary>Upload plugin</Button>
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
    activeItem: 'studies'
};

export default MenuContainer;