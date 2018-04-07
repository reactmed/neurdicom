import React, {Component} from 'react';
import {
    Button, Checkbox, Container, Dropdown, Form, Icon, Input, Menu, Radio, Segment, Select, Sidebar, Table,
    TextArea, TransitionablePortal as visible
} from "semantic-ui-react";
import StudiesService from "../services/DicomService";
import {Link} from "react-router-dom";
import MenuContainer from "../components/common/MenuContainer";

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

export default class StudiesPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            studies: []
        };
        this.setState.bind(this);
    }

    componentWillMount() {
        StudiesService.findStudies(studyList => {
            console.log(studyList);
            this.setState({studies: studyList})
        });
    }

    render() {
        const {activeItem} = this.state;
        return (
            <MenuContainer activeItem='studies'>
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
                            label='Study Instance UID'
                            action={<Dropdown button basic floating options={patientMatcherOptions}
                                              defaultValue='EXACT'/>}
                            icon='search'
                            iconPosition='left'
                            placeholder='Study Instance UID'
                        />
                        <Form.Field control={Select} label='Modality' options={options}
                                    placeholder='Modality'/>
                    </Form.Group>
                </Form>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Patient Name</Table.HeaderCell>
                            <Table.HeaderCell>Study Instance UID</Table.HeaderCell>
                            <Table.HeaderCell>Study Date</Table.HeaderCell>
                            <Table.HeaderCell>Study Description</Table.HeaderCell>
                            <Table.HeaderCell>Modality</Table.HeaderCell>
                            <Table.HeaderCell>Images Count</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {
                            this.state.studies.map(study => {
                                return (
                                    <Table.Row>
                                        <Table.Cell>
                                            {study['patient']['patient_name']}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Link to={`/studies/${study['id']}`}>
                                                {study['study_instance_uid']}
                                            </Link>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {study['study_date']}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {study['study_description']}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {study['modalities'].join(', ')}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {study['images_count']}
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })
                        }
                    </Table.Body>
                </Table>
            </MenuContainer>
        )
    }
}