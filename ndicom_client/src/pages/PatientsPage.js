import React, {Component} from 'react';
import {Translate} from 'react-localize-redux';
import StudiesService from "../services/DicomService";
import {Button, Dropdown, Select, Table, Form, Menu, Segment, Grid, Header} from "semantic-ui-react";
import {Link} from "react-router-dom";
import MenuContainer from "../components/common/MenuContainer";

const patientMatcherOptions = [
    {key: 'exact', text: 'Точный поиск', value: 'exact'},
    {key: 'startswith', text: 'Начинается с', value: 'startswith'},
    {key: 'endswith', text: 'Заканчивается', value: 'endswith'},
    {key: 'contains', text: 'Нечеткий поиск', value: 'contains'},
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
                <Translate>
                    {
                        (translate) => (
                            <Grid columns='equal'>
                                <Grid.Row>
                                    <Grid.Column>
                                        <Form>
                                            <Form.Group widths='equal'>
                                                <Form.Input
                                                    id='id_patient_name'
                                                    label={translate('patient.name')}
                                                    action={<Dropdown id='id_patient_name_filter' button basic floating
                                                                      options={patientMatcherOptions}
                                                                      defaultValue='exact'/>}
                                                    icon='search'
                                                    name='patient_name'
                                                    iconPosition='left'
                                                    placeholder={translate('patient.name')}
                                                    onKeyPress={this.handleFindInputOnChange}
                                                />
                                                <Form.Input
                                                    id='id_patient_id'
                                                    label={translate('patient.id')}
                                                    action={<Dropdown id='id_patient_id_filter' button basic floating
                                                                      options={patientMatcherOptions}
                                                                      defaultValue='exact'/>}
                                                    icon='search'
                                                    name='patient_id'
                                                    iconPosition='left'
                                                    placeholder={translate('patient.id')}
                                                    onKeyPress={this.handleFindInputOnChange}
                                                />
                                            </Form.Group>
                                        </Form>
                                        <Table>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell>{translate('patient.id')}</Table.HeaderCell>
                                                    <Table.HeaderCell>{translate('patient.name')}</Table.HeaderCell>
                                                    <Table.HeaderCell>{translate('patient.gender')}</Table.HeaderCell>
                                                    <Table.HeaderCell>{translate('patient.birthdate')}</Table.HeaderCell>
                                                    <Table.HeaderCell>{translate('patient.age')}</Table.HeaderCell>
                                                    <Table.HeaderCell>{translate('patient.imagesCount')}</Table.HeaderCell>
                                                    <Table.HeaderCell/>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                {
                                                    this.state.patients.map(patient => {
                                                        return (
                                                            <Table.Row>
                                                                <Table.Cell>
                                                                    {patient['patient_id'] || translate('patient.anonymized')}
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    {patient['patient_name'] || translate('patient.anonymized')}
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    {patient['patient_sex'] || translate('patient.anonymized')}
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    {patient['patient_birthdate'] || translate('patient.anonymized')}
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    {patient['patient_age'] || translate('patient.anonymized')}
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    {patient['images_count']}
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    <Button positive as={Link}
                                                                            to={`/patient/${patient['id']}/studies`}>{translate('open')}</Button>
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
                        )
                    }
                </Translate>
            </MenuContainer>
        );
    }
}

export default PatientsPage;