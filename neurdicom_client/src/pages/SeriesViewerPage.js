import React, {Component} from 'react';
import MenuContainer from "../components/common/MenuContainer.component";
import {Button, Grid, Header, Segment} from "semantic-ui-react";
// import * as cornerstone from 'cornerstone-core';
import DicomService from "../services/DicomService";

class SeriesViewerPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            instances: [],
            seriesId: props.match.params.id
        };
        this.setState.bind(this);
    }

    componentWillMount() {
        const seriesId = this.state.seriesId;
        DicomService.findInstancesBySeriesId(seriesId, instances => {
            this.setState({instances: instances});
        });
    }

    // componentDidUpdate() {
    //     console.log('COMPONENT DID MOUNT');
    //     const instances = this.state.instances;
    //     instances.forEach((instance, index) => {
    //         const instanceId = `instance${index + 1}`;
    //         const instanceDiv = document.getElementById(instanceId);
    //         console.log(instance['image']);
    //         cornerstone.loadImage(instance['image']).then(function (image) {
    //             cornerstone.displayImage(instanceDiv, image);
    //         });
    //     });
    // }

    render() {
        console.log('RENDER');
        const instances = this.state.instances;
        return (
            <Grid columns='equals'>
                <Grid.Row>
                    <div style={{}}>

                    </div>
                    <Grid.Column width={3} style={{overflow_y: 'scroll', max_height: '100px'}}>
                        {
                            instances.map((instance, index) => {
                                const elem = (
                                    <div>
                                        <Header as='h3' attached inverted color='red'>
                                            Instance {index + 1}
                                        </Header>
                                        <Segment attached>
                                            <div id={'instance' + (index + 1)}>

                                            </div>
                                        </Segment>
                                    </div>
                                );

                                return elem;
                            })
                        }
                    </Grid.Column>
                    <Grid.Column>
                        World
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }
}

export default SeriesViewerPage;