import React from "react"
import {Button, DatePicker, Form, Input, message, Radio} from "antd"
import AbstractCreator from "./AbstractCreator"
import EntitySimpleTable from "../EntitySimpleTable"
import CampaignPresenter from "./CampaignPresenter"
import EntitiesApi from "../../EntitiesApi"

class MissionCreator extends AbstractCreator {

    state = { campBtn: "select campaign" }

    campOk = () => {
        if (EntitiesApi.idBuffer !== null) {
            this.setState({ campBtn: EntitiesApi.idBuffer })
        } else message.error({ content: "You should choose base from table" })
    }

    onTrigger = (formData) => {
        this.props.parentCallback({
            ...formData,
            campId: this.state.campBtn
        })
    }

    render() {
        const { RangePicker } = DatePicker
        return <Form onFinish={this.onTrigger}>
            <Form.Item label="Arrival location"
                       name="arrivalLocation">
                <Input placeholder="Use space as separator"/>
            </Form.Item>
            <Form.Item label="Campaign ID"
                       name="campId">
                <Button type="link"
                        onClick={ () => this.showConfirm(<EntitySimpleTable presenter={CampaignPresenter}/>, this.campOk) }>
                    {this.state.campBtn}
                </Button>
            </Form.Item>
            <Form.Item label="Departure location"
                       name="departureLocation">
                <Input placeholder="Use space as separator"/>
            </Form.Item>
            <Form.Item label="Period"
                       name="period">
                <RangePicker showTime/>
            </Form.Item>
            <Form.Item label="Enemies"
                       name="enemies">
                <Input/>
            </Form.Item>
            <Form.Item label="Legal status"
                       name="legalStatus"
                       rules={[ { required: true, message: "Choose legality status of mission" }]}>
                <Radio.Group>
                    <Radio value={true}>legal</Radio>
                    <Radio value={false}>illegal</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">Submit</Button>
            </Form.Item>
        </Form>
    }
}

const MissionPresenter = {
    url: "mission",
    idField: "missId",
    filteredColumns: {
        legalStatus: [
            { text: "legal", value: true },
            { text: "illegal", value: false }
        ]
    },
    creator: <MissionCreator/>
}

export default MissionPresenter