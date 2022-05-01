import React, { useState } from "react"
import { PageHeader } from 'antd'
import { Layout, Modal } from "antd"
import Credits from "./Credits"
import EntityTable from "./EntityTable"
import BasePresenter from "./presentors/BasePresenter.jsx"

export default () => {
  const [presenter, setPresenter] = useState(BasePresenter)
  return <Layout style={{minHeight: '100vh'}}>
    <Layout.Header>
      <PageHeader
        title="Title"
        subTitle="This is a subtitle"
      />
    </Layout.Header>
    <Layout.Content>
      <div className="site-layout-background" style={{minHeight: 360}}>
        <EntityTable presenter={presenter}/>
      </div>
    </Layout.Content>
    <Layout.Footer style={{textAlign: "center"}}>
      <a onClick={ () => {
        Modal.info({
          title: "Credits",
          content: <Credits/>
        })
      }}>Kulbako Artemy ©2022</a>
    </Layout.Footer>
  </Layout>
}