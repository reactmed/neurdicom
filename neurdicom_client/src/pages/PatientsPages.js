import React, {Component} from 'react';
import StudiesService from "../services/DicomService";
import {Button, Dropdown, Select, Table, Form, Menu, Segment} from "semantic-ui-react";
import {Link} from "react-router-dom";
import MenuContainer from "../components/common/MenuContainer.component";

const patientMatcherOptions = [
    {key: 'EXACT', text: 'Exact equals', value: 'EXACT'},
    {key: 'STARTS_WITH', text: 'Starts with', value: 'STARTS_WITH'},
    {key: 'ENDS_WITH', text: 'Ends with', value: 'ENDS_WITH'},
    {key: 'FUZZY', text: 'Fuzzy matching', value: 'FUZZY'},
];

class PatientsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            patients: []
        };
        this.setState.bind(this);
    }

    componentDidMount() {
        StudiesService.findPatients(patients => {
            this.setState({patients: patients});
        });
    }

    render() {
        console.log(this.state.patients);
        return (
            <MenuContainer activeItem='patients'>
                <Form>
                    <Form.Group widths='equal'>
                        <Form.Input
                            label='Patient Name'
                            action={<Dropdown button basic floating options={patientMatcherOptions}
                                              defaultValue='EXACT'/>}
                            icon='search'
                            iconPosition='left'
                            placeholder='Patient Name'
                        />
                        <Form.Input
                            label='Patient ID'
                            action={<Dropdown button basic floating options={patientMatcherOptions}
                                              defaultValue='EXACT'/>}
                            icon='search'
                            iconPosition='left'
                            placeholder='Patient ID'
                        />
                    </Form.Group>
                </Form>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Patient ID</Table.HeaderCell>
                            <Table.HeaderCell>Patient Name</Table.HeaderCell>
                            <Table.HeaderCell>Patient Sex</Table.HeaderCell>
                            <Table.HeaderCell>Patient Birthdate</Table.HeaderCell>
                            <Table.HeaderCell>Patient Age</Table.HeaderCell>
                            <Table.HeaderCell>Images Count</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {
                            this.state.patients.map(patient => {
                                return (
                                    <Table.Row>
                                        <Table.Cell>
                                            {patient['patient_id'] || 'Anonymized'}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {patient['patient_name'] || 'Anonymized'}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {patient['patient_sex']}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {patient['patient_birthdate']}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {patient['patient_age']}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {patient['images_count']}
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })
                        }
                    </Table.Body>
                </Table>
            </MenuContainer>
        );
    }
}

export default PatientsPage;