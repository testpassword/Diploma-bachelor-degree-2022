import React from "react"
import { Input, Form, Button, Radio } from "antd"
import AbstractCreator from "./AbstractCreator"

class BaseCreator extends AbstractCreator {

    render() {
        return <Form onFinish={this.onTrigger}>
                <Form.Item label="Location"
                           name="location"
                           rules={[{ required: true, message: "Input base location" }]}>
                    <Input/>
                </Form.Item>
                <Form.Item label="Status"
                           name="status"
                           rules={[{ required: true, message: "Choose base status" }]}>
                    <Radio.Group
                        options={BasePresenter.filteredColumns.status.map(o => o.text)}
                        optionType="button"
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Submit</Button>
                </Form.Item>
        </Form>
    }
}

const BasePresenter = {
    url: "base",
    idField: "baseId",
    filteredColumns: {
        status: [
            { text: "working", value: "working" },
            { text: "closed", value: "closed" },
            { text: "destroyed", value: "destroyed" },
            { text: "abandoned", value: "abandoned" },
            { text: "captured", value: "captured" },
            { text: "for_sale", value: "for_sale" }
        ]
    },
    creator: <BaseCreator/>
}

export default BasePresenter