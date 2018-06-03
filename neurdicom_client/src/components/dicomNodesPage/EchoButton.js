import React, {Component} from 'react';
import {Button, Label} from "semantic-ui-react";
import PropTypes from 'prop-types';
import * as axios from "axios/index";
import {Translate} from "react-localize-redux";

class EchoButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: null
        };
        this.setState = this.setState.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        axios.get(this.props.echoUrl).then(
            () => {
                this.setState({status: true});
            },
            () => {
                this.setState({status: false});
            }
        )
    }

    render() {
        console.log(this.state.status);
        return (
            <Translate>
                {
                    (translate) => (
                        <div>
                            <Button onClick={this.onClick} primary>
                                {translate('dicomNode.echo')}
                            </Button>
                            {
                                (this.state.status !== undefined && this.state.status !== null) && (
                                    <b style={{
                                        color: this.state.status ? 'green' : 'red',
                                        fontSize: '15',
                                        marginLeft: '10px',
                                        marginRight: '10px'
                                    }}>
                                        {
                                            this.state.status ? translate('success') : translate('fail')
                                        }
                                    </b>
                                )
                            }
                        </div>
                    )
                }
            </Translate>
        );
    }
}

EchoButton.propTypes = {
    echoUrl: PropTypes.string
};

export default EchoButton;