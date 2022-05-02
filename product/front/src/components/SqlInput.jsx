import React, {useState} from "react"
import {Input} from "antd"
import CodeMirror from "@uiw/react-codemirror"
import {sql} from "@codemirror/lang-sql"

export default ({ value = {}, onChange }) => {
  const [code, setCode] = useState(0)

  const triggerChange = (changedValue) => {
    onChange?.({
      number: code,
      ...value,
      ...changedValue,
    })
  }
  const onNumberChange = (e) => {
    const newNumber = e.target.value
    if (!('number' in value)) { setCode(newNumber) }
    triggerChange({ number: newNumber })
  }

  return <CodeMirror
    value="console.log('hello world!');"
    theme="dark"
    extensions={[sql()]}
    onChange={(value, viewUpdate) => {
      console.log("value:", value);
    }}
  />
  /*return <Input
      type="text"
      value={value.number || number}
      onChange={onNumberChange}
    />*/
}