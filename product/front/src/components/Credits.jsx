import React from "react"
import { Col, Image, Row, Divider } from "antd"
import KtorLogo from "../resources/images/ktor_logo.svg"
import ExposedLogo from "../resources/images/exposed_logo.png"

export default () =>
  <div style={{textAlign: "center"}}>
    <Divider orientation="center">Developer:</Divider>
    <Row gutter={[0, 10]} alight={"middle"}>
      <Col span={12}>
        <Image
          src="https://avatars2.githubusercontent.com/u/48172248?s=460&u=18fe6de540ebdb9008ccf4065d7175d4ce892f7e&v=4"
          width={63}
          preview={false}/>
      </Col>
      <Col span={12}><a href="https://se.ifmo.ru/~s265570/cv/">testpassword</a></Col>
    </Row>
    <Divider orientation="center">Libraries:</Divider>
    <Row gutter={[0, 10]}>
      <Col span={12}>
        <Image
          src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
          width={63}
          preview={false}/>
      </Col>
      <Col span={12}><a href="https://ant.design/">Antd</a></Col>
    </Row>
    <Row gutter={[0, 10]}>
      <Col span={12}>
        <Image
          src={KtorLogo}
          width={63}
          preview={false}/>
      </Col>
      <Col span={12}><a href="https://ktor.io/">Ktor</a></Col>
    </Row>
    <Row gutter={[0, 10]}>
      <Col span={12}>
        <Image src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
               width={63}
               preview={false}/>
      </Col>
      <Col span={12}><a href="https://ru.reactjs.org/">React</a></Col>
    </Row>
    <Row gutter={[0, 10]}>
      <Col span={12}>
        <Image src={ExposedLogo}
               width={63}
               preview={false}/>
      </Col>
      <Col span={12}><a href="https://github.com/JetBrains/Exposed">Exposed</a></Col>
    </Row>
    <Row gutter={[0, 10]}>
      <Col span={12}>
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg"
          width={63}
          preview={false}/>
      </Col>
      <Col span={12}><a href="https://www.postgresql.org/">PostgreSQL</a></Col>
    </Row>
  </div>