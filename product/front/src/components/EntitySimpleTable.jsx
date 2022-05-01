import React from "react"
import EntitiesApi from "../EntitiesApi.js"
import {Table, message, Checkbox} from "antd"

class EntitySimpleTable extends React.Component {

    state = { items: [] }

    createSimpleColumnsFromObject = object => {
        const cols = Object.keys(object).map(key => {
            const strKey = key.toString()
            let modifiedColumn = {
                title: strKey.split(/(?=[A-Z])/).map(s => s.toUpperCase()).join(" "),
                dataIndex: strKey,
                defaultSortOrder: "ascend",
                sortDirections: ["ascend", "descend"],
                sorter: (a, b) => a[key].localeCompare(b[key])
            }
            if (typeof object[key] === "boolean")
                modifiedColumn = {
                    ...modifiedColumn,
                    render: t => <Checkbox checked={t}/>
                }
            return modifiedColumn
        })
        this.setState({ columns: cols })
    }

    getRecords = () => {
        EntitiesApi.get(this.props.presenter.url)
            .then(res => res.json())
            .then(
                data => {
                    this.setState({ items: data })
                    this.createSimpleColumnsFromObject(data[0])
                },
                error => message.error({ content: error.message.toLocaleString() })
            )
    }

    componentDidMount() { this.getRecords() }

    /* Здесь я не придумал, как передать ключ выбранного элемента на два родителя вверх, поэтому просто отправил его
    в глобальную переменную. ПОВТОРЯТЬ ТАКОЕ НЕЛЬЗЯ! */
    rowSelection = {
        onChange: (selectedRowKeys) => {
            EntitiesApi.idKey = this.props.presenter.idField
            EntitiesApi.idBuffer = selectedRowKeys[0]
        }
    }

    render() {
        return <Table
            scroll={{ x: 800 }}
            rowSelection={{ type: 'radio', ...this.rowSelection }}
            rowKey={this.props.presenter.idField}
            columns={this.state.columns}
            dataSource={this.state.items}
        />
    }
}

export default EntitySimpleTable