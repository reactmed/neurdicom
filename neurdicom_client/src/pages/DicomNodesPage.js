import React, {Component} from 'react';
import MenuContainer from "../components/common/MenuContainer";
import {Form, Header, Icon, Modal, Select, Table} from "semantic-ui-react";
import DicomNodeService from "../services/DicomNodeService";
import * as axios from 'axios';
import Button from "semantic-ui-react/dist/es/elements/Button/Button";
import EchoButton from "../components/dicomNodesPage/EchoButton.component";

class DicomNodesPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dicomNodes: []
        };
        this.setState = this.setState.bind(this);
    }

    componentDidMount() {
        DicomNodeService.findDicomNodes(nodes => {
            this.setState({dicomNodes: nodes})
        });
    }

    render() {
        const dicomNodes = this.state.dicomNodes;

        return (
            <MenuContainer activeItem='DICOM nodes'>
                <Modal ref={'echo_alert'} basic size='small' trigger={<div></div>}>
                    <Header icon='archive' content='Archive Old Messages' className="ui center aligned header"/>
                    <Modal.Content>
                        <p>Your inbox is getting full, would you like us to enable automatic archiving of old
                            messages?</p>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button basic color='red' inverted>
                            <Icon name='remove'/> No
                        </Button>
                        <Button color='green' inverted>
                            <Icon name='checkmark'/> Yes
                        </Button>
                    </Modal.Actions>
                </Modal>
                <Form>
                    <Form.Group widths='equal'>
                        <Form.Input
                            label='Name'
                            placeholder='Name'
                        />
                    </Form.Group>
                    <Form.Group widths='equal'>
                        <Form.Input
                            label='AET Title'
                            placeholder='AET Title'
                        />
                    </Form.Group>
                    <Form.Group widths='equal'>
                        <Form.Input
                            label='Peer AET Title'
                            placeholder='Peer AET Title'
                        />
                        <Form.Input
                            label='Peer Hostname'
                            placeholder='Peer Hostname'
                        />
                        <Form.Input
                            label='Peer Port'
                            placeholder='Peer Port'
                        />
                    </Form.Group>
                    <Form.Button positive>Save node</Form.Button>
                </Form>
                {
                    dicomNodes && dicomNodes.length > 0 && (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>
                                        Name
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        AET Title
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        Peer AET Title
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        Peer Host
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        Peer Port
                                    </Table.HeaderCell>
                                    <Table.HeaderCell collapsed>

                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {
                                    dicomNodes.map(node => {
                                        return (
                                            <Table.Row>
                                                <Table.Cell>
                                                    {node.name}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {node['aet_title']}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {node['peer_aet_title']}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {node['peer_host']}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {node['peer_port']}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <EchoButton
                                                        echoUrl={`http://localhost:8080/api/dicom_nodes/${node['id']}/echo`}/>
                                                </Table.Cell>
                                            </Table.Row>
                                        )
                                    })
                                }
                            </Table.Body>
                        </Table>
                    )
                }
            </MenuContainer>
        )
    }
}

export default DicomNodesPage;