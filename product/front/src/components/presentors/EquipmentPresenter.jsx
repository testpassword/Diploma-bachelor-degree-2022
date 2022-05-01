import React from "react"
import {Button, Form, Input, message} from "antd"
import AbstractCreator from "./AbstractCreator"
import EntitySimpleTable from "../EntitySimpleTable"
import MrePresenter from "./MrePresenter"
import EntitiesApi from "../../EntitiesApi"

class EquipmentCreator extends AbstractCreator {

    state = { mreBtn: "select mre" }

    mreOk = () => {
        if (EntitiesApi.idBuffer !== null) {
            this.setState({ mreBtn: EntitiesApi.idBuffer })
        } else message.error({ content: "You should choose mre from table" })
    }

    onTrigger = (formData) => {
        this.props.parentCallback({
            ...formData,
            mreId: this.state.mreBtn
        })
    }

    render() {
        return <Form onFinish={this.onTrigger}>
            <Form.Item label="Camouflage"
                       name="camouflage">
                <Input/>
            </Form.Item>
            <Form.Item label="Communication"
                       name="communication">
                <Input/>
            </Form.Item>
            <Form.Item label="Intelligence"
                       name="intelligence">
                <Input/>
            </Form.Item>
            <Form.Item label="Medical"
                       name="medical">
                <Input/>
            </Form.Item>
            <Form.Item label="Extras"
                       name="extra">
                <Input placeholder="Use space as separator"/>
            </Form.Item>
            <Form.Item label="Mre ID"
                       name="mreId">
                <Button type="link"
                        onClick={ () => this.showConfirm(<EntitySimpleTable presenter={MrePresenter}/>, this.mreOk) }>
                    {this.state.mreBtn}
                </Button>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">Submit</Button>
            </Form.Item>
        </Form>
    }
}

const EquipmentPresenter = {
    url: "equipment",
    idField: "equipId",
    creator: <EquipmentCreator/>
}

export default EquipmentPresenter