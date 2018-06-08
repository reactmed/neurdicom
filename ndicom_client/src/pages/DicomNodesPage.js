import React, {Component} from 'react';
import MenuContainer from "../components/common/MenuContainer";
import {Form, Table} from "semantic-ui-react";
import DicomNodeService from "../services/DicomNodeService";
import EchoButton from "../components/dicomNodesPage/EchoButton";
import {Translate} from "react-localize-redux";
import Button from "semantic-ui-react/dist/es/elements/Button/Button";
import * as axios from "axios";

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
            dicomNodes: [],
            newDicomNode: {}
        };
        this.setState = this.setState.bind(this);
    }

    onInputParam = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        const params = this.state.newDicomNode;
        params[name] = value;
        this.setState({
            newDicomNode: params
        })
    };

    componentDidMount() {
        DicomNodeService.findDicomNodes(nodes => {
            this.setState({dicomNodes: nodes})
        });
    }

    onAddDicomNode = () => {
        const newDicomNode = this.state.newDicomNode;
        axios.post('/api/dicom_nodes', JSON.stringify(newDicomNode),
            {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/octet-stream'
                }
            }
        ).then(() => {
            DicomNodeService.findDicomNodes(nodes => {
                this.setState({dicomNodes: nodes})
            });
        });
    };

    onDeleteDicomNode = (dicomNode) => {
        axios.delete(
            `/api/dicom_nodes/${dicomNode['id']}`
        ).then(resp => {
            DicomNodeService.findDicomNodes(nodes => {
                this.setState({dicomNodes: nodes})
            });
        });
    };

    onDownloadImages = (dicomNode) => {
        axios.get(
            `/api/dicom_nodes/${dicomNode['id']}/instances`
        ).then(resp => {
            alert(`Изображения с ${dicomNode['remote_url']} успешно загружены`);
            DicomNodeService.findDicomNodes(nodes => {
                this.setState({dicomNodes: nodes})
            });
        }, err => {
            alert(`Изображения с ${dicomNode['remote_url']} не могут быть загружены!`);
        })
    };

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
                                            name={'name'}
                                            placeholder={translate('dicomNode.name')}
                                            onChange={this.onInputParam}
                                        />
                                        <Form.Input
                                            label={translate('dicomNode.remoteUrl')}
                                            name={'remote_url'}
                                            placeholder={translate('dicomNode.remoteUrl')}
                                            onChange={this.onInputParam}
                                        />
                                        <Form.Input
                                            label={translate('dicomNode.instancesUrl')}
                                            name={'instances_url'}
                                            placeholder={translate('dicomNode.instancesUrl')}
                                            onChange={this.onInputParam}
                                        />
                                        <Form.Input
                                            label={translate('dicomNode.instanceFileUrl')}
                                            name={'instance_file_url'}
                                            placeholder={translate('dicomNode.instanceFileUrl')}
                                            onChange={this.onInputParam}
                                        />
                                    </Form.Group>
                                    <Form.Button onClick={this.onAddDicomNode}
                                                 positive>{translate('dicomNode.add')}</Form.Button>
                                </Form>
                                {
                                    dicomNodes && dicomNodes.length > 0 && (
                                        <Table>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell>
                                                        {translate('dicomNode.name')}
                                                    </Table.HeaderCell>
                                                    {/*<Table.HeaderCell>*/}
                                                    {/*{translate('dicomNode.aet')}*/}
                                                    {/*</Table.HeaderCell>*/}
                                                    <Table.HeaderCell>
                                                        {translate('dicomNode.remoteUrl')}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        {translate('dicomNode.instancesUrl')}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        {translate('dicomNode.instanceFileUrl')}
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
                                                                {/*<Table.Cell>*/}
                                                                {/*{node['aet_title']}*/}
                                                                {/*</Table.Cell>*/}
                                                                <Table.Cell>
                                                                    {node['remote_url']}
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    {node['instances_url']}
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    {node['instance_file_url']}
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    <Button color={'red'}
                                                                            onClick={() => this.onDeleteDicomNode(node)}>{translate('delete')}</Button>
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    <Button color={'green'}
                                                                            onClick={() => this.onDownloadImages(node)}>{translate('dicomNode.download')}</Button>
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