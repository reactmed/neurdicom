import MenuContainer from "../components/common/MenuContainer.component";
import React, {Component} from "react";
import PluginsService from "../services/PluginsService";
import {Button, Divider, Dropdown, Form, Header, Message, Segment, Select} from "semantic-ui-react";

const patientMatcherOptions = [
    {key: 'EXACT', text: 'Exact equals', value: 'EXACT'},
    {key: 'STARTS_WITH', text: 'Starts with', value: 'STARTS_WITH'},
    {key: 'ENDS_WITH', text: 'Ends with', value: 'ENDS_WITH'},
    {key: 'FUZZY', text: 'Fuzzy matching', value: 'FUZZY'},
];
const options = [
    {key: 'DX', text: 'DX (Digital Radiography)', value: 'DX'},
    {key: 'MR', text: 'MR (Magnetic Resonance)', value: 'MR'},
    {key: 'CT', text: 'CT (Computer Tomography)', value: 'CT'},
    {key: 'US', text: 'US (Ultrasound)', value: 'US'},
    {key: 'ECG', text: 'ECG (Electrocardiography)', value: 'ECG'},
    {key: 'XA', text: 'XA (X-Ray)', value: 'XA'},
    {key: 'OT', text: 'OT (Other)', value: 'OT'},
];

class PluginsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            plugins: []
        };
        this.setState.bind(this);
    }

    componentDidMount() {
        PluginsService.findPlugins(plugins => {
            this.setState({plugins: plugins});
        });
    }

    render() {
        console.log(this.state.plugins);
        if (this.state.plugins && this.state.plugins.length > 0) {
            return (
                <MenuContainer activeItem='plugins'>
                    <div style={{margin: '30px'}}>
                        <Form style={{marginBottom: '40px'}}>
                            <Form.Group widths='equal'>
                                <Form.Input
                                    label='Plugin Name'
                                    action={<Dropdown button basic floating options={patientMatcherOptions}
                                                      defaultValue='EXACT'/>}
                                    icon='search'
                                    iconPosition='left'
                                    placeholder='Plugin Name'
                                />
                                <Form.Input
                                    label='Author Name'
                                    action={<Dropdown button basic floating options={patientMatcherOptions}
                                                      defaultValue='EXACT'/>}
                                    icon='search'
                                    iconPosition='left'
                                    placeholder='Plugin Author'
                                />
                            </Form.Group>
                        </Form>
                        {
                            this.state.plugins.map(plugin => {
                                return (
                                    <Segment>
                                        <Header as='h1'>{plugin['name']}
                                        </Header>
                                        <b>Author: </b>{plugin['author']}
                                        <br/>
                                        <b>Info: </b>{plugin['info']}
                                        <Divider/>
                                        <div style={{textAlign: 'right'}}>
                                            <Button positive>Download</Button>
                                        </div>
                                    </Segment>
                                )
                            })
                        }
                    </div>
                </MenuContainer>
            )
        }
        else {
            return (
                <MenuContainer activeItem='plugins'>
                    <Message warning header='Not plugins!' content='Not plugins found. You can add new plugin.'/>
                </MenuContainer>
            )
        }
    }
}

export default PluginsPage;