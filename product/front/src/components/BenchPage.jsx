import React, {useEffect, useState} from 'react'
import Credits from './Credits'
import {Form, Input, Button, Card, Image, Layout, Modal, Radio, Select, message} from 'antd'
import API from '../api.js'
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons"

export default () => {

  const formItemLayout = {
    labelCol: {
      xs: {span: 24},
      sm: {span: 4},
    },
    wrapperCol: {
      xs: {span: 24},
      sm: {span: 20},
    },
  }
  const formItemLayoutWithOutLabel = {
    wrapperCol: {
      xs: {span: 24, offset: 0},
      sm: {span: 20, offset: 4},
    },
  };
  const {getConsumers, getFormats, getInstances, bench} = API
  const [consumers, setConsumers] = useState([])
  const [formats, setFormats] = useState([])
  const [instances, setInstances] = useState([])
  useEffect(() => {
    getConsumers().then(setConsumers)
    getFormats().then(setFormats)
    getInstances().then(setInstances)
  }, [])
  const toRadioGroup = vals =>
    <Radio.Group>
      {vals.map(it => <Radio.Button value={it}>{it}</Radio.Button>)}
    </Radio.Group>

  return <Layout style={{minHeight: '100vh'}}>
    <Layout.Header>
      <Image
        width={200}
        src="https://itmo.ru/file/stat/482/slogans03.png"
      />
      Автоматизация индексирования базы данных на основе истории запросов
    </Layout.Header>
    <Layout.Content style={{margin: 50}}>
      <Card>
        <Form onFinish={val => {
          const hide = message.loading('Action in progress...', 0)
          const connectionUrl = `jdbc:${val.instance}://${val.url}/${val.logicalName};${val.username};${val.password}`
          bench({connectionUrl, ...val})
            .then(it => {
              hide()
              message.success(it.details)
            })
            .catch(it => {
              hide()
              it.json().then(j => message.error(j.details, 5))
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
            rules={[
              {
                validator: async (_, names) => (!names || names.length < 1) ? Promise.reject(new Error('At least 1 queue')) : undefined,
              },
            ]}
          >
            {(queries, {add, remove}, {errors}) => (
              <>
                {queries.map((queue, index) => (
                  <Form.Item
                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                    label={index === 0 ? 'Queries' : ''}
                    required={false}
                    key={queue.key}
                  >
                    <Form.Item
                      {...queue}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "Please input queue or delete this field.",
                        },
                      ]}
                      noStyle
                    >

                      <Input placeholder="queue" style={{width: '95%'}}/>

                    </Form.Item>
                    {queries.length > 1 ? (
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        onClick={() => remove(queue.name)}
                      />
                    ) : null}
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    style={{width: '100%'}}
                    icon={<PlusOutlined/>}
                  >
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