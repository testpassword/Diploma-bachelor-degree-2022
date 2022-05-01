import React from "react"
import {Button, Form, Input, InputNumber, message, Radio} from "antd"
import AbstractCreator from "./AbstractCreator"
import EntitySimpleTable from "../EntitySimpleTable"
import EmployeePresenter from "./EmployeePresenter"
import EntitiesApi from "../../EntitiesApi"

class MedicalCardCreator extends AbstractCreator {

    state = { empBtn: "select employee" }

    empOk = () => {
        if (EntitiesApi.idBuffer !== null) {
            this.setState({ empBtn: EntitiesApi.idBuffer })
        } else message.error({ content: "You should choose employee from table" })
    }

    onTrigger = (formData) => {
        this.props.parentCallback({
            ...formData,
            empId: this.state.empBtn
        })
    }

    render() {
        return <Form onFinish={this.onTrigger}>
            <Form.Item label="Diseases"
                       name="diseases">
                <Input placeholder="Use space as separator"/>
            </Form.Item>
            <Form.Item label="Gender"
                       name="gender"
                       rules={[ { required: true, message: "Choose gender" }]}>
                <Radio.Group>
                    <Radio value={true}>male</Radio>
                    <Radio value={false}>female</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item label="Height cm"
                       name="heightCm"
                       rules={[ { required: true, message: "Input employee height" }]}>
                <InputNumber/>
            </Form.Item>
            <Form.Item label="Weight kg"
                       name="weightKg"
                       rules={[ { required: true, message: "Input employee weight" }]}>
                <InputNumber/>
            </Form.Item>
            <Form.Item label="Blood"
                       name="blood"
                       rules={[ { required: true, message: "Choose blood type - it's about saving life!" }]}>
                <Radio.Group
                    options={MedicalCardPresenter.filteredColumns.blood.map(o => o.text)}
                    optionType="button"
                />
            </Form.Item>
            <Form.Item label="Employee ID"
                       name="empId">
                <Button type="link"
                        onClick={ () => this.showConfirm(<EntitySimpleTable presenter={EmployeePresenter}/>, this.empOk) }>
                    {this.state.empBtn}
                </Button>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">Submit</Button>
            </Form.Item>
        </Form>
    }
}

const MedicalCardPresenter = {
    url: "medicalCard",
    idField: "medId",
    filteredColumns: {
        blood: [
            { text: "O-", value: "O-" },
            { text: "O+", value: "O+" },
            { text: "A-", value: "A-" },
            { text: "A+", value: "A+" },
            { text: "B-", value: "B+" },
            { text: "AB-", value: "AB-" },
            { text: "AB+", value: "AB+" },
        ],
        gender: [
            { text: "male", value: true },
            { text: "female", value: false }
        ]
    },
    creator: <MedicalCardCreator/>
}

export default MedicalCardPresenter