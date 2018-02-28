import React, {Component} from 'react';
import {
    Button, Checkbox, Divider, Dropdown, Form, Grid, Header, Input, Message, Radio, Segment, Select, Table,
    TextArea
} from "semantic-ui-react";
import StudiesService from "../services/DicomService";
import MenuContainer from "../components/common/MenuContainer.component";
import {Link} from "react-router-dom";

const options = [
    {key: 'DX', text: 'DX (Digital Radiography)', value: 'DX'},
    {key: 'MR', text: 'MR (Magnetic Resonance)', value: 'MR'},
    {key: 'CT', text: 'CT (Computer Tomography)', value: 'CT'},
    {key: 'US', text: 'US (Ultrasound)', value: 'US'},
    {key: 'ECG', text: 'ECG (Electrocardiography)', value: 'ECG'},
    {key: 'XA', text: 'XA (X-Ray)', value: 'XA'},
    {key: 'OT', text: 'OT (Other)', value: 'OT'},
];

const patientMatcherOptions = [
    {key: 'EXACT', text: 'Exact equals', value: 'EXACT'},
    {key: 'STARTS_WITH', text: 'Starts with', value: 'STARTS_WITH'},
    {key: 'ENDS_WITH', text: 'Ends with', value: 'ENDS_WITH'},
    {key: 'FUZZY', text: 'Fuzzy matching', value: 'FUZZY'},
];

export default class StudySeriesPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            study: {},
            studyId: props.match.params.id
        };
        this.setState.bind(this);
    }

    componentWillMount() {
        StudiesService.findStudyById(this.state.studyId, study => {
            this.setState({study: study})
        });
    }

    render() {
        const study = this.state.study;
        const series = this.state.study['series'];
        if (series && series.length > 0) {
            return (
                <MenuContainer activeItem=''>
                    <Grid columns='equal'>
                        <Grid.Row>
                            <Grid.Column width={5}>
                                <Header as='h3' inverted color='blue' attached>Patient</Header>
                                <Segment inverted attached>
                                    <h4>{study['patient']['patient_name'] || 'Anonymized'}</h4>
                                    Patient ID: <b>{study['patient']['patient_id']}</b>
                                    <br/>
                                    Patient Sex: <b>{study['patient']['patient_sex']}</b>
                                    <br/>
                                    Patient Age: <b>{study['patient']['patient_age']}</b>
                                </Segment>
                                <Header as='h3' inverted color='blue' attached>Study</Header>
                                <Segment inverted attached>
                                    <h4>{study['study_description']}</h4>
                                    Study Date: <b>{study['study_date'] || '––'}</b>
                                    <br/>
                                    Referring Physician Name: <b>{study['study_date'] || '––'}</b>
                                </Segment>
                            </Grid.Column>
                            <Grid.Column>
                                <Form>
                                    <Form.Group widths='equal'>
                                        <Form.Input
                                            label='Series Instance UID'
                                            action={<Dropdown button basic floating options={patientMatcherOptions}
                                                              defaultValue='EXACT'/>}
                                            icon='search'
                                            iconPosition='left'
                                            placeholder='Series Instance UID'
                                        />
                                        <Form.Field control={Select} label='Modality' options={options}
                                                    placeholder='Modality'/>
                                    </Form.Group>
                                </Form>
                                {
                                    series.map((seriesItem, index) => {
                                        return (
                                            <div>
                                                <Header as='h4' inverted color='yellow'
                                                        attached>
                                                    <Link to={`/series/${seriesItem['id']}`}>
                                                        {seriesItem['protocol_name'] || `Series ${index + 1}`}
                                                    </Link>
                                                </Header>
                                                <Segment attached>
                                                    <b>Series
                                                        Description: </b> {seriesItem['series_description'] || '––'}
                                                    <br/>
                                                    <b>Modality: </b>{seriesItem['modality']}
                                                    <br/>
                                                    <b>Body Part
                                                        Examined: </b>{seriesItem['body_part_examined'] || '––'}
                                                    <br/>
                                                    <b>Patient Position: </b>{seriesItem['patient_position']}
                                                    <br/>
                                                    <b>Series Number: </b>{seriesItem['series_number']}
                                                    <br/>
                                                    <b>Images Count: </b>{seriesItem['images_count']}
                                                </Segment>
                                                <br/>
                                            </div>
                                        );
                                    })
                                }
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </MenuContainer>
            );
        }
        else {
            return (
                <MenuContainer>
                    <Message warning header='Not series!' content='Not series found for study'/>
                </MenuContainer>
            );
        }
    }
}