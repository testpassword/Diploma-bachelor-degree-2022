import React from "react"
import {Button, Form, Input, Radio} from "antd"
import AbstractCreator from "./AbstractCreator"

class TransportCreator extends AbstractCreator {

    render() {
        return <Form onFinish={this.onTrigger}>
            <Form.Item label="Name"
                       name="name"
                       rules={[{ required: true, message: "Input transport name" }]}>
                <Input/>
            </Form.Item>
            <Form.Item label="Status"
                       name="status"
                       rules={[{ required: true, message: "Choose status of transport" }]}>
                <Radio.Group
                    options={TransportPresenter.filteredColumns.status.map(o => o.text)}
                    optionType="button"
                />
            </Form.Item>
            <Form.Item label="Type"
                       name="type"
                       rules={[{ required: true, message: "Input type of transport" }]}>
                <Input/>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">Submit</Button>
            </Form.Item>
        </Form>
    }
}

const TransportPresenter = {
    url: "transport",
    idField: "transId",
    filteredColumns: {
        status: [
            { text: "available", value: "available" },
            { text: "under_repair", value: "under_repair" },
            { text: "destroyed", value: "destroyed" },
            { text: "broken", value: "broken" }
        ]
    },
    creator: <TransportCreator/>
}

export default TransportPresenter