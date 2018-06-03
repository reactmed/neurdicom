import React, {Component} from 'react';
import {Button, Form, Header, Segment} from "semantic-ui-react";

class LoginPage extends Component {
    render() {
        return (
            <div>
                <div style={{marginTop: '15%', marginLeft: '30%', marginRight: '30%'}}>
                    <Header as={'h3'}>
                        Вход
                    </Header>
                    <Form stacked>
                        <Form.Input
                            label='Электронная почта'
                            icon='user'
                            iconPosition='left'
                            placeholder='Электронная почта'
                        />
                        <Form.Input
                            type='password'
                            label='Пароль'
                            icon='lock'
                            iconPosition='left'
                            placeholder='Пароль'
                        />
                        <Form.Button primary fluid>Войти</Form.Button>
                        <b>Забыли пароль? </b><a href={'/api/reset_password'}>Вы можете его восстановить</a>
                    </Form>
                </div>
            </div>
        )
    }
}

export default LoginPage;