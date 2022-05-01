import React from "react"
import {
    Table, message, Input, Button, Space, Layout, Popover, Checkbox, InputNumber, Select, Tooltip, Modal, DatePicker } from "antd"
import Highlighter from "react-highlight-words"
import { DeleteOutlined, PlusOutlined, SearchOutlined, DownloadOutlined, CloseOutlined } from "@ant-design/icons"
import { Header, Content } from "antd/lib/layout/layout"
import { EditableCell, EditableRow } from "./EditableRow.jsx"
import { last, first, shuffle } from "underscore"
import EntitiesApi from "../EntitiesApi.js"
import EntitySimpleTable from "./EntitySimpleTable"
import moment from "moment"
import PositionPresenter from "./presentors/PositionPresenter"
import BasePresenter from "./presentors/BasePresenter"
import MrePresenter from "./presentors/MrePresenter"
import EmployeePresenter from "./presentors/EmployeePresenter"
import CampaignPresenter from "./presentors/CampaignPresenter"
import EquipmentPresenter from "./presentors/EquipmentPresenter"

class EntityTable extends React.Component {

    constructor(props) {
        super(props)
        message.config({ duration: 5 })
        const presenters = new Map()
        presenters.set("posId", PositionPresenter)
        presenters.set("baseId", BasePresenter)
        presenters.set("mreId", MrePresenter)
        presenters.set("empId", EmployeePresenter)
        presenters.set("campId", CampaignPresenter)
        presenters.set("equipId", EquipmentPresenter)
        this.state = { additionalPresenters: presenters }
    }

    state = {
        additionalPresenters: [],
        isLoading: true,
        items: [],
        searchText: "",
        searchedColumn: "",
        selectedRowKeys: [],
        columns: [],
        addFormVisible: false,
        focusedEntity: ""
    }

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={ node => { this.searchInput = node} }
                    placeholder={`Search ${dataIndex}`}
                    value={first(selectedKeys)}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}>
                        Search
                    </Button>
                    <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex] ?
                record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : "",
        onFilterDropdownVisibleChange: visible => { if (visible) setTimeout(() => this.searchInput.select(), 100) },
        render: text =>
            this.state.searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[this.state.searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ""}
                />
            ) : (text)
    })

    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm()
        this.setState({ searchText: first(selectedKeys), searchedColumn: dataIndex })
    }

    handleReset = clearFilters => {
        clearFilters()
        this.setState({ searchText: "" })
    }

    onSelectChange = selectedRowKeys => { this.setState({selectedRowKeys}) }

    handleSave = modified_record => {
        const p = this.props.presenter
        EntitiesApi.put(p.url, modified_record)
            .then(res => res.text())
            .then(
                data => {
                    message.success({ content: data })
                    const items = this.state.items
                    const orig_record = items.find((it) => it[p.idField] === modified_record[p.idField])
                    Object.keys(modified_record).forEach(key => {
                        if (modified_record[key] !== orig_record[key]) orig_record[key] = modified_record[key]
                        this.setState({ items: items })
                    })
                },
                error => message.error({ content: error.message.toLocaleString() })
            )
    }

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

    onSelectReferenceId = (key) => {
        const editedEntityId = first(this.state.selectedRowKeys)
        if (editedEntityId === undefined) message.error({ content: "Use should choose record before set reference" })
        else {
            this.setState({ selectedRowKeys: [] })
            this.handleSave({
                [this.props.presenter.idField]: editedEntityId,
                [key]: EntitiesApi.idBuffer
            })
        }
    }

    createColumnsFromObject = object => {
        const p = this.props.presenter
        const cols = Object.keys(object).map(key => {
            const strKey = key.toString()
            const filters = p.filteredColumns
            let modifiedColumn = {
                title: strKey.split(/(?=[A-Z])/).map(s => s.toUpperCase()).join(" "),
                dataIndex: strKey,
                defaultSortOrder: "ascend",
                sortDirections: ["ascend", "descend"],
                editable: (strKey !== p.idField),
                sorter: (a, b) => (typeof a[key] === "string") ? (a[key].localeCompare(b[key])) : (a[key] - b[key])
            }
            modifiedColumn = (filters !== undefined && strKey in filters) ?
                {
                    ...modifiedColumn,
                    filters: filters[strKey],
                    onFilter: (v, r) => r[strKey] === v,
                    render: t => <Select defaultValue={t}/>
            } :
                {
                    ...this.getColumnSearchProps(strKey),
                    ...modifiedColumn
                }
            if (typeof object[key] === "boolean")
                modifiedColumn = {
                    ...modifiedColumn,
                    render: t => <Checkbox checked={t}/>
                }
            if (typeof object[key] === "number" && modifiedColumn.editable)
                modifiedColumn = (key.includes("Id") && key !== p.idField) ?
                    {
                        ...modifiedColumn,
                        editable: false,
                        render: val =>
                            <Tooltip title={() =>
                                EntitiesApi.get(
                                    this.state.additionalPresenters.get(key).url,
                                    [val],
                                    true
                                )}
                                color={ shuffle(['pink', 'red', 'yellow', 'orange', 'cyan', 'green', 'blue', 'purple', 'geekblue',
                                        'magenta', 'volcano', 'gold', 'lime'])[0] }>
                                <Button
                                    type="link"
                                    onClick={ () => this.showConfirm(
                                        <EntitySimpleTable presenter={this.state.additionalPresenters.get(key)}/>,
                                        () => this.onSelectReferenceId(key)) }>
                                    {val}
                                </Button>
                            </Tooltip>
                    } :
                    {
                        ...modifiedColumn,
                        render: t => <InputNumber defaultValue={t}/>
                    }
            if (typeof object[key] === "object")
                modifiedColumn = {
                    ...modifiedColumn,
                    render: t => {
                        const format = "DD-MM-YYYY/HH:mm:ss"
                        const timestamp = t.date.toString() + "/" + t.time.hour + ":" + t.time.minute + ":" + t.time.second
                        console.log(timestamp)
                        return <DatePicker showTime defaultValue={moment(timestamp, format)} format={format}/>
                    }
                }
            if (modifiedColumn.editable)
                modifiedColumn = {
                    ...modifiedColumn,
                    onCell: (record) => ({
                        record,
                        editable: modifiedColumn.editable,
                        dataIndex: modifiedColumn.dataIndex,
                        title: modifiedColumn.title,
                        handleSave: this.handleSave,
                    })
                }
            return modifiedColumn
        })
        this.setState({ columns: cols })
    }

    getRecords = () => {
        EntitiesApi.get(this.props.presenter.url)
            .then(res => {
                this.setState({ isLoading: false} )
                return res.json()
                })
            .then(
                data => {
                    this.setState({ items: data })
                    this.createColumnsFromObject(first(data))
                    message.success({ content: "Data loaded" })
                },
                error => message.error({ content: error.message.toLocaleString() }))
    }

    removeRecords = () => {
        if (this.state.selectedRowKeys === undefined || this.state.selectedRowKeys.length === 0)
            message.success({ content: "Can't delete, nothing selected" })
        else {
            EntitiesApi.delete(this.props.presenter.url, this.state.selectedRowKeys)
                .then(res => res.text())
                .then(
                    data => {
                        message.success({ content: data })
                        this.setState(
                            { items: this.state.items.filter(x =>
                                !this.state.selectedRowKeys.includes(x[this.props.presenter.idField]))
                            })
                    },
                        error => message.error({ content: error.message.toLocaleString() })
                )
        }
    }

    addRecord = (childData) => {
        if (childData === undefined) return
        EntitiesApi.post(this.props.presenter.url, this.props.presenter.idField, childData).then(res => res.text()).then(
            data => {
                message.success({ content: data })
                this.setState({ addFormVisible: false })
                this.getRecords()
            },
            error => message.error({ content: error.message.toLocaleString() })
        )
    }

    //Пример плохого планирования. Я попал в ад коллбеков, из-за чего на нажатие кнопки открытия формы пришлось добавить отдельную функцию
    handleAddClick = () => {
        this.addRecord()
        this.setState({ addFormVisible: true })
    }

    downloadRecords = () => {
        EntitiesApi.get(
            this.props.presenter.url,
            (this.state.selectedRowKeys === 0) ? [] : this.state.selectedRowKeys)
            .then(res => res.text())
            .then(
                data => {
                require("file-saver").saveAs(
                    new Blob([data], { type: "text/json;charset=utf-8" }),
                    last(this.props.presenter.url.split("/")) + ".json"
                )
            },
            error => message.error({ content: error.message.toLocaleString() })
            )
    }

    // Вызывается лишь раз, при создании компонента
    componentDidMount() {
        this.getRecords()
        this.updatePresenter()
    }

    // Вызывается каждый раз при обновлении props-ов из родителя
    componentDidUpdate(prevProps) {
        if (this.props.presenter !== prevProps.presenter) this.getRecords()
        this.updatePresenter()
    }

    updatePresenter() {
        this.props.presenter.creator =
            React.cloneElement(this.props.presenter.creator, { parentCallback: this.addRecord }, null)
    }

    render() {
        const { isLoading, items, selectedRowKeys } = this.state
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT]
        }
        const components = {body: { row: EditableRow, cell: EditableCell }}
        return <Layout className="site-layout">
            <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
                <Space size={"middle"}>
                    <Popover
                        trigger="click"
                        content={
                            <div>
                                {this.props.presenter.creator}
                                <Button shape="round"
                                        icon={<CloseOutlined/>}
                                        size="small"
                                        onClick={() => this.setState({ addFormVisible: false })}
                                />
                            </div>
                        }
                        visible={this.state.addFormVisible}>
                        <Button type="primary"
                                icon={<PlusOutlined/>}
                                ghost={true}
                                onClick={this.handleAddClick}>
                            Add record
                        </Button>
                    </Popover>
                    <Button icon={<DeleteOutlined/>}
                            ghost={true}
                            danger
                            onClick={this.removeRecords}>
                        Remove
                    </Button>
                    <Tooltip title="All objects from table will be downloaded if nothing is selected">
                        <Button
                            icon={<DownloadOutlined/>}
                            ghost={true}
                            onClick={this.downloadRecords}>
                            { `Download as json (${(this.state.items === undefined) ? 0 : this.state.items.length})` }
                        </Button>
                    </Tooltip>
                </Space>
            </Header>
            <Content style={{ marginTop: "64px" }}>
                <div className="site-layout-background" style={{ minHeight: 360 }}>
                    <Table
                        components={components}
                        rowKey={this.props.presenter.idField}
                        rowSelection={rowSelection}
                        columns={this.state.columns}
                        dataSource={items}
                        loading={isLoading}
                        pagination={{ position: ["bottomCenter"] }}
                    />
                </div>
            </Content>
        </Layout>
    }
}

export default EntityTable