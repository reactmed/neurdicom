import React, {Component} from 'react';
import {
    Button, Checkbox, Divider, Dropdown, Form, Grid, Header, Input, Message, Radio, Segment, Select, Table,
    TextArea
} from "semantic-ui-react";
import StudiesService from "../services/DicomService";
import MenuContainer from "../components/common/MenuContainer";
import {Link} from "react-router-dom";
import {Translate} from "react-localize-redux";

const options = [
    {key: 'DX', text: 'DX', value: 'DX'},
    {key: 'MR', text: 'MR', value: 'MR'},
    {key: 'CT', text: 'CT', value: 'CT'},
    {key: 'US', text: 'US', value: 'US'},
    {key: 'ECG', text: 'ECG', value: 'ECG'},
    {key: 'XA', text: 'XA', value: 'XA'},
    {key: 'OT', text: 'OT', value: 'OT'},
];

const patientMatcherOptions = [
    {key: 'EXACT', text: 'Точный поиск', value: 'EXACT'},
    {key: 'STARTS_WITH', text: 'Начинается с', value: 'STARTS_WITH'},
    {key: 'ENDS_WITH', text: 'Заканчивается', value: 'ENDS_WITH'},
    {key: 'FUZZY', text: 'Нечеткий поиск', value: 'FUZZY'},
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
                    <Translate>
                        {
                            (translate) => (
                                <Grid columns='equal'>
                                    <Grid.Row>
                                        <Grid.Column width={5}>
                                            <Header as='h3' inverted color='blue'
                                                    attached>{translate('patient.patient')}</Header>
                                            <Segment inverted attached>
                                                <h4>{study['patient']['patient_name'] || translate('patient.anonymized')}</h4>
                                                {translate('patient.id')}: <b>{study['patient']['patient_id']}</b>
                                                <br/>
                                                {translate('patient.gender')}: <b>{study['patient']['patient_sex']}</b>
                                                <br/>
                                                {translate('patient.age')}: <b>{study['patient']['patient_age']}</b>
                                            </Segment>
                                            <Header as='h3' inverted color='blue'
                                                    attached>{translate('study.study')}</Header>
                                            <Segment inverted attached>
                                                <h4>{study['study_description']}</h4>
                                                {translate('study.date')}: <b>{study['study_date'] || '––'}</b>
                                                <br/>
                                                {translate('study.referringPhysician')}: <b>{study['referring_physician'] || '––'}</b>
                                            </Segment>
                                        </Grid.Column>
                                        <Grid.Column>
                                            <Form>
                                                <Form.Group widths='equal'>
                                                    <Form.Input
                                                        label={translate('study.id')}
                                                        action={<Dropdown button basic floating
                                                                          options={patientMatcherOptions}
                                                                          defaultValue='EXACT'/>}
                                                        icon='search'
                                                        iconPosition='left'
                                                        placeholder={translate('study.id')}
                                                    />
                                                    <Form.Field control={Select} label={translate('study.modality')}
                                                                options={options}
                                                                placeholder={translate('study.modality')}/>
                                                </Form.Group>
                                            </Form>
                                            {
                                                series.map((seriesItem, index) => {
                                                    return (
                                                        <div>
                                                            <Header as='h4' inverted color='white'
                                                                    attached textAlign={'left'}>
                                                                {seriesItem['protocol_name'] || `${translate('series.series')} ${index + 1}`}
                                                            </Header>
                                                            <Segment attached>
                                                                <b>{translate('series.description')}: </b> {seriesItem['series_description'] || '––'}
                                                                <br/>
                                                                <b>{translate('series.modality')}: </b>{seriesItem['modality']}
                                                                <br/>
                                                                <b>{translate('series.bodyPartExamined')}: </b>{seriesItem['body_part_examined'] || '––'}
                                                                <br/>
                                                                <b>{translate('series.patientPosition')}: </b>{seriesItem['patient_position']}
                                                                <br/>
                                                                <b>{translate('series.seriesNumber')}: </b>{seriesItem['series_number']}
                                                                <br/>
                                                                <b>{translate('imagesCount')}: </b>{seriesItem['images_count']}
                                                            </Segment>
                                                            <div className={'ui attached right aligned header'}>
                                                                <Button floated positive as={Link}
                                                                        to={`/series/${seriesItem['id']}`}>{translate('open')}</Button>
                                                            </div>
                                                            <br/>
                                                        </div>
                                                    );
                                                })
                                            }
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            )
                        }
                    </Translate>
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