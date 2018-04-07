import React, {Component} from 'react';
import StudiesService from "../services/DicomService";
import {Button, Dropdown, Select, Table, Form, Menu, Segment, Grid, Header} from "semantic-ui-react";
import {Link} from "react-router-dom";
import MenuContainer from "../components/common/MenuContainer";

const patientMatcherOptions = [
    {key: 'exact', text: 'Exact equals', value: 'exact'},
    {key: 'startswith', text: 'Starts with', value: 'startswith'},
    {key: 'endswith', text: 'Ends with', value: 'endswith'},
    {key: 'contains', text: 'Contains', value: 'contains'},
];

const filterTextToValue = {
    'Exact equals': 'exact',
    'Starts with': 'startswith',
    'Ends with': 'endswith',
    'Contains': 'contains'
};

class PatientsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            patients: []
        };
        this.setState = this.setState.bind(this);
        this.handleFindInputOnChange = this.handleFindInputOnChange.bind(this);
    }

    componentWillMount() {
        StudiesService.findPatients(patients => {
            this.setState({patients: patients});
        });
    }

    handleFindInputOnChange(event) {
        if (event.key === 'Enter') {
            const patientName = document.getElementById('id_patient_name').value;
            const patientId = document.getElementById('id_patient_id').value;
            const patientNameFilter = filterTextToValue[document.getElementById('id_patient_name_filter').innerText.trim()];
            const patientIdFilter = filterTextToValue[document.getElementById('id_patient_id_filter').innerText.trim()];
            console.log(patientNameFilter);
            StudiesService.findPatients(patients => {
                console.log(this);
                this.setState({patients: patients});
            }, {
                'patient_name': `${patientNameFilter}=${patientName}`,
                'patient_id': `${patientIdFilter}=${patientId}`
            });
        }
    }

    render() {
        console.log(this.state.patients);
        return (
            <MenuContainer activeItem='patients'>
                <Grid columns='equal'>
                    <Grid.Row>
                        <Grid.Column>
                            <Form>
                                <Form.Group widths='equal'>
                                    <Form.Input
                                        id='id_patient_name'
                                        label='Patient Name'
                                        action={<Dropdown id='id_patient_name_filter' button basic floating
                                                          options={patientMatcherOptions}
                                                          defaultValue='exact'/>}
                                        icon='search'
                                        name='patient_name'
                                        iconPosition='left'
                                        placeholder='Patient Name'
                                        onKeyPress={this.handleFindInputOnChange}
                                    />
                                    <Form.Input
                                        id='id_patient_id'
                                        label='Patient ID'
                                        action={<Dropdown id='id_patient_id_filter' button basic floating
                                                          options={patientMatcherOptions}
                                                          defaultValue='exact'/>}
                                        icon='search'
                                        name='patient_id'
                                        iconPosition='left'
                                        placeholder='Patient ID'
                                        onKeyPress={this.handleFindInputOnChange}
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
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </MenuContainer>
        );
    }
}

export default PatientsPage;