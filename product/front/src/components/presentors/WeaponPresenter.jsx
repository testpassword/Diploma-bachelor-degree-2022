import React from "react"
import {Button, Form, Input, InputNumber} from "antd"
import AbstractCreator from "./AbstractCreator"

class WeaponCreator extends AbstractCreator {

    render() {
        return <Form onFinish={this.onTrigger}>
            <Form.Item label="Caliber"
                       name="caliber">
                <InputNumber min={0}/>
            </Form.Item>
            <Form.Item label="Name"
                       name="name"
                       rules={[{ required: true, message: "Input name of weapon" }]}>
                <Input/>
            </Form.Item>
            <Form.Item label="Rate of fire"
                       name="rateOfFire">
                <InputNumber min={0}/>
            </Form.Item>
            <Form.Item label="Sighting range m"
                       name="sightingRangeM">
                <InputNumber min={0}/>
            </Form.Item>
            <Form.Item label="Type"
                       name="type"
                       rules={[{ required: true, message: "Input type of weapon" }]}>
                <Input/>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">Submit</Button>
            </Form.Item>
        </Form>
    }
}

const WeaponPresenter = {
    url: "weapon",
    idField: "weaponId",
    creator: <WeaponCreator/>
}

export default WeaponPresenter