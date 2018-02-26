import React, {Component} from 'react';
import {Button, Form, Header, Segment} from "semantic-ui-react";

class LoginPage extends Component {
    render() {
        return (
            <div>
                <div style={{marginTop: '15%', marginLeft: '30%', marginRight: '30%'}}>
                    <Header as={'h3'}>
                        Login
                    </Header>
                    <Form stacked>
                        <Form.Input
                            label='Username'
                            icon='user'
                            iconPosition='left'
                            placeholder='Username'
                        />
                        <Form.Input
                            type='password'
                            label='Password'
                            icon='lock'
                            iconPosition='left'
                            placeholder='Password'
                        />
                        <Form.Button primary fluid>Log In</Form.Button>
                        <b>Forgot a password? </b><a href={'/api/reset_password'}>You can reset a password</a>
                    </Form>
                </div>
            </div>
        )
    }
}

export default LoginPage;