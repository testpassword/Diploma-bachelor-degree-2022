import React, {useEffect, useState} from 'react'
import Credits from './Credits'
import {Form, Input, Button, Card, Image, Layout, Modal, Radio, Select, message, Result} from 'antd'
import API from '../api.js'
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons"
import CodeMirror from "@uiw/react-codemirror"
import {sql} from "@codemirror/lang-sql"

export default () => {

  const formItemLayout = {
    labelCol: {
      sm: {
        span: 4
      }
    }
  }
  const formItemLayoutWithOutLabel = {
    wrapperCol: {
      sm: {
        span: 20,
        offset: 4
      }
    }
  }
  const [consumers, setConsumers] = useState([])
  const [formats, setFormats] = useState([])
  const [instances, setInstances] = useState([])
  const [status, setStatus] = useState('')
  const [resSubtitle, setResSubtitle] = useState('')
  useEffect(() => {
    API.getConsumers().then(setConsumers)
    API.getFormats().then(setFormats)
    API.getInstances().then(setInstances)
  }, [])
  const toRadioGroup = vals =>
    <Radio.Group>
      {vals.map(it => <Radio.Button value={it}>{it}</Radio.Button>)}
    </Radio.Group>

  return <Layout style={{minHeight: '100vh'}}>
    <Layout.Header style={{height: '5rem'}}>
      <Image
        width={250}
        src="https://itmo.ru/file/stat/482/slogans03.png"
      />
      <span style={{fontSize: '1.1rem'}}>Автоматизация индексирования базы данных на основе истории запросов</span>
    </Layout.Header>
    <Layout.Content style={{margin: 60}}>
      <Card>
        <Form labelCol={{ span: 3}}
          onFinish={val => {
            const hide = message.loading('Action in progress...', 0)
            const connectionUrl = `jdbc:${val.instance}://${val.url}/${val.logicalName};${val.username};${val.password}`
            API.bench({connectionUrl, ...val})
              .then(it => {
                hide()
                setStatus('success')
                setResSubtitle(it.details)
              })
              .catch(it => {
                hide()
                setStatus('error')
                it.json().then(j => setResSubtitle(j.details))
              })
          }}>
          <Form.Item label="Database connection">
            <Input.Group compact>
              <Form.Item
                name="instance"
                rules={[{required: true}]}
              >
                <Select placeholder="Database instance">
                  {instances.map(it => <Select.Option value={it}>{it}</Select.Option>)}
                </Select>
              </Form.Item>
              <Form.Item
                name="url"
                rules={[{required: true}]}>
                <Input placeholder="Connection url (with port)"/>
              </Form.Item>
              <Form.Item
                name="logicalName"
                rules={[{required: true}]}
              >
                <Input placeholder="Logical database name"/>
              </Form.Item>
              <Form.Item
                name="username"
                rules={[{required: true}]}
              >
                <Input placeholder="Username"/>
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{required: true}]}
              >
                <Input.Password placeholder="Password"/>
              </Form.Item>
            </Input.Group>
          </Form.Item>
          <Form.Item
            label="Reports consumer"
            name="consumer"
            initialValue={'FS'}
          >
            {toRadioGroup(consumers)}
          </Form.Item>
          <Form.Item
            label="Reports format"
            name="format"
            initialValue={'CSV'}
          >
            {toRadioGroup(formats)}
          </Form.Item>
          <Form.List
            name="queries"
            rules={[{
              validator: async (_, queries) => (!queries || queries.length < 1) ? Promise.reject(new Error('At least 1 queue')) : undefined,
              }]}
          >
            {(queries, {add, remove}, {errors}) => (
              <>
                {queries.map((queue, index) => (
                  <Form.Item
                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                    label={index === 0 ? 'Queries' : ''} required={false} key={queue.key}
                  >
                    <Form.Item
                      {...queue}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[{
                          required: true,
                          whitespace: true,
                          message: "Please input queue or delete this field.",
                        }]}
                      noStyle
                    >
                      <CodeMirror theme="dark" extensions={[sql()]}/>
                    </Form.Item>
                    {queries.length > 1 ?
                      <MinusCircleOutlined className="dynamic-delete-button" onClick={() => remove(queue.name)}/>
                      : null
                    }
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} style={{width: '100%'}} icon={<PlusOutlined/>}>
                    Add queue
                  </Button>
                  <Form.ErrorList errors={errors}/>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item
            label="Consumer parameters"
            initialValue={''}
            name="consumerParams">
            <Input/>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
            >
              Submit
            </Button>
          </Form.Item>
          { status && <Result status={status} subTitle={resSubtitle}/> }
        </Form>
      </Card>
    </Layout.Content>
    <Layout.Footer style={{textAlign: "center"}}>
      <a onClick={() => {
        Modal.info({
          title: "Credits",
          content: <Credits/>
        })
      }}>Kulbako Artemy ©2022</a>
    </Layout.Footer>
  </Layout>
}