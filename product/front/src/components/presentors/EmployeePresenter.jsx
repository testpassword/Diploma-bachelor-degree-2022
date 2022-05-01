import React from "react"
import {Button, DatePicker, Form, Input, Radio, message} from "antd"
import moment from "moment"
import EntitySimpleTable from "../EntitySimpleTable"
import AbstractCreator from "./AbstractCreator"
import EntitiesApi from "../../EntitiesApi"
import BasePresenter from "./BasePresenter"
import PositionPresenter from "./PositionPresenter"

class EmployeeCreator extends AbstractCreator {

    state = {
        baseBtn: "select base",
        posBtn: "select position",
    }

    baseOk = () => {
        if (EntitiesApi.idBuffer !== null) {
            this.setState({ baseBtn: EntitiesApi.idBuffer })
        } else message.error({ content: "You should choose base from table" })
    }

    posOk = () => {
        if (EntitiesApi.idBuffer !== null) {
            this.setState({ posBtn: EntitiesApi.idBuffer })
        } else message.error({ content: "You should choose employee position from table" })
    }

    onTrigger = (formData) =>
        this.props.parentCallback({
            ...formData,
            posId: this.state.posBtn,
            baseId: this.state.baseBtn
        })

    render() {
        return <Form onFinish={this.onTrigger}>
            <Form.Item label="Base ID"
                       name="baseId">
                <Button type="link"
                        onClick={ () => this.showConfirm(<EntitySimpleTable presenter={BasePresenter}/>, this.baseOk) }>
                    {this.state.baseBtn}
                </Button>
            </Form.Item>
            <Form.Item label="Date of birth"
                       name="dateOfBirth"
                       rules={[{ required: true, message: "Input date of birth new employee" }]}>
                <DatePicker format={['DD/MM/YYYY', 'DD/MM/YY']}/>
            </Form.Item>
            <Form.Item label="Education"
                       name="education"
                       rules={[{ message: "Input education of new employee" }]}>
                <Input/>
            </Form.Item>
            <Form.Item label="Hiring date"
                       name="hiringDate"
                       rules={[{ required: true, message: "Input date of hiring new employee" }]}>
                <DatePicker format={"DD.MM.YYYY"} defaultValue={ moment() }/>
            </Form.Item>
            <Form.Item label="Is married"
                       name="isMarried"
                       rules={[{ required: true, message: "Choose married status of new employee" }]}>
                <Radio.Group>
                    <Radio value={true}>yes</Radio>
                    <Radio value={false}>no</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item label="Name"
                       name="name"
                       rules={[ { required: true, message: "Input employee name" }]}>
                <Input/>
            </Form.Item>
            <Form.Item label="Position ID"
                       name="posId">
                <Button type="link"
                        onClick={ () => this.showConfirm(<EntitySimpleTable presenter={PositionPresenter}/>, this.posOk) }>
                    {this.state.posBtn}
                </Button>
            </Form.Item>
            <Form.Item label="Surname"
                       name="surname"
                       rules={[ { required: true, message: "Input employee surname" }]}>
                <Input/>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">Submit</Button>
            </Form.Item>
        </Form>
    }
}

const EmployeePresenter = {
    url: "employee",
    idField: "empId",
    filteredColumns: {
        isMarried: [
            { text: "married", value: true },
            { text: "single", value: false }
        ]
    },
    creator: <EmployeeCreator/>
}

export default EmployeePresenter