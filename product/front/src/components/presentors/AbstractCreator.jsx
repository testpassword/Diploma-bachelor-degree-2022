import React from "react"
import { Modal } from "antd"

class AbstractCreator extends React.Component {

    onTrigger = (formData) => this.props.parentCallback(formData)

    showConfirm = (table, onOkCallback, onCancelCallback) => {
        const { confirm } = Modal
        confirm({
            zIndex: 1100,
            width: 1100,
            title: "Select record",
            content: table,
            onOk() { onOkCallback() },
            onCancel() { if (onCancelCallback !== undefined) onCancelCallback() }
        })
    }
}

export default AbstractCreator