import React, {Component} from 'react';
import MenuContainer from "../components/common/MenuContainer";
import {Form, Table} from "semantic-ui-react";
import DicomNodeService from "../services/DicomNodeService";
import EchoButton from "../components/dicomNodesPage/EchoButton";
import {Translate} from "react-localize-redux";

const protocolOptions = [
    {
        "key": "dicomweb",
        "value": "dicomweb",
        "text": "DICOMWeb"
    },
    {
        "key": "dicom",
        "value": "dicom",
        "text": "DICOM"
    },
];

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
                <Translate>
                    {
                        (translate) => (
                            <div>
                                <Form>
                                    <Form.Group widths='equal'>
                                        <Form.Input
                                            label={translate('dicomNode.name')}
                                            placeholder={translate('dicomNode.name')}
                                        />
                                        <Form.Select
                                            label={translate('dicomNode.protocol')}
                                            placeholder={translate('dicomNode.protocol')}
                                            options={protocolOptions}
                                        />
                                    </Form.Group>
                                    <Form.Group widths='equal'>
                                        <Form.Input
                                            label={translate('dicomNode.aet')}
                                            placeholder={translate('dicomNode.aet')}
                                        />
                                    </Form.Group>
                                    <Form.Group widths='equal'>
                                        <Form.Input
                                            label={translate('dicomNode.remoteAet')}
                                            placeholder={translate('dicomNode.remoteAet')}
                                        />
                                        <Form.Input
                                            label={translate('dicomNode.remoteHost')}
                                            placeholder={translate('dicomNode.remoteHost')}
                                        />
                                        <Form.Input
                                            label={translate('dicomNode.remotePort')}
                                            placeholder={translate('dicomNode.remotePort')}
                                        />
                                    </Form.Group>
                                    <Form.Button positive>{translate('dicomNode.add')}</Form.Button>
                                </Form>
                                {
                                    dicomNodes && dicomNodes.length > 0 && (
                                        <Table>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell>
                                                        {translate('dicomNode.name')}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        {translate('dicomNode.aet')}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        {translate('dicomNode.remoteAet')}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        {translate('dicomNode.remoteHost')}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        {translate('dicomNode.remotePort')}
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
                            </div>
                        )
                    }
                </Translate>
            </MenuContainer>
        )
    }
}

export default DicomNodesPage;