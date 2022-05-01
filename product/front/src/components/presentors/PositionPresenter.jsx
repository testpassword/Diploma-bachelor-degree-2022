import React from "react"
import {Button, Form, Input, InputNumber, message, Radio} from "antd"
import AbstractCreator from "./AbstractCreator"
import EntitiesApi from "../../EntitiesApi"
import EntitySimpleTable from "../EntitySimpleTable"
import EquipmentPresenter from "./EquipmentPresenter"

class PositionCreator extends AbstractCreator {

    state = { equipBtn: "select position" }

    equipOk = () => {
        if (EntitiesApi.idBuffer !== null) {
            this.setState({ equipBtn: EntitiesApi.idBuffer })
        } else message.error({ content: "You should choose equipment from table" })
    }

    onTrigger = (formData) => {
        this.props.parentCallback({
            ...formData,
            equipId: this.state.equipBtn
        })
    }

    render() {
        return <Form onFinish={this.onTrigger}>
            <Form.Item label="Equipment ID"
                       name="equipId">
                <Button type="link"
                        onClick={ () => this.showConfirm(<EntitySimpleTable presenter={EquipmentPresenter}/>, this.equipOk) }>
                    {this.state.equipBtn}
                </Button>
            </Form.Item>
            <Form.Item label="Forces"
                       name="forces">
                <Radio.Group
                    options={PositionPresenter.filteredColumns.forces.map(o => o.text)}
                    optionType="button"
                />
            </Form.Item>
            <Form.Item label="name"
                       name="name"
                       rules={[{ required: true, message: "Input position name" }]}>
                <Input/>
            </Form.Item>
            <Form.Item label="Rank"
                       name="rank">
                <Input/>
            </Form.Item>
            <Form.Item label="Salary"
                       name="salary"
                       rules={[{ required: true, message: "Set employee salary - it should be greater then three hundred bucks" }]}>
                <InputNumber min={300}/>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">Submit</Button>
            </Form.Item>
        </Form>
    }
}

const PositionPresenter = {
    url: "position",
    idField: "posId",
    filteredColumns: {
        forces: [
            { text: "NAVY", value: "NAVY" },
            { text: "AF", value: "AF" },
            { text: "GF", value: "GF" }
        ]
    },
    creator: <PositionCreator/>
}

export default PositionPresenter