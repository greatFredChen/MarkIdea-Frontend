### Wedea 前端

#### 项目结构:

- cloudfunctions/: 云函数目录
  - getOpenId/: 获取openid的云函数

  - createIdea/: 处理想法创建并同步到数据库的云函数

- miniprogram/: 小程序源代码(前端)

  - sensitive-config.js: 项目敏感配置文件: 存放着项目后端地址, 访问秘钥等信息, 需要手动创建并填写信息, 该文件不会上传git, 结构如下:

    ```js
    module.exports = {
      backendHost: "https://yourbackenddomain.com", // 注意, 这里没有斜杠, 需要在URL加上斜杠
      backendKey: "your BackendAppKey",
      qqmapSdkKey: "your QQMapSDK develop key", // 详情请见下方微信小程序位置服务
    }
    ```

  - components/: 组件目录

  - images/: 图片资源目录

  - pages/: 小程序页面及页面逻辑代码(包含wxml,wxss,js,json)

  - utils/: 容器js，主要为自己写的外部逻辑功能函数

  - style/: 小程序引用的外部wxss文件所在目录

  - app.js: 全局函数以及全局变量

  - app.json: 全局布局设置以及外部组件引用

  - app.wxss: 全局页面/组件布局以及引用外部wxss

  - sitemap.json:

- 项目基于微信小程序云开发以及weui组件库，云开发负责实现请求以及关系型数据库，weui组件库负责实现外观美化

- 请保证手机微信版本已经是最新版本，本小程序要求基础库版本至少为2.9.0

#### 项目开发和调试

- 开发环境: 微信开发者工具

- 调试环境: 请使用微信开发者工具中的“真机调试”

### 开发依赖组件介绍

#### 云开发 quickstart

这是云开发的快速启动指引，其中演示了如何上手使用云开发的三大基础能力：

- 数据库：一个既可在小程序前端操作，也能在云函数中读写的 JSON 文档型数据库
- 文件存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码

参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

#### weui-miniprogram
- 请下载weui-miniprogram，并将weui-miniprogram文件夹放置于miniprogram文件夹下，并将weui.wxss放置于style文件夹下！
- 或者使用npm构建并引入小程序
- 参考教程: https://www.cnblogs.com/jianxian/p/11121514.html or https://developers.weixin.qq.com/miniprogram/dev/extended/weui/quickstart.html

#### comi
- 用于解析 markdown 文本
- 文档 https://github.com/Tencent/omi/tree/master/packages/comi
- 拷贝 https://github.com/Tencent/omi/tree/master/packages/comi/omip/src/components/comi 到目录 miniprogram/comi 下

#### tcb-router
- 微信云函数路由管理

#### eslint
- 配置使用的 eslint 使用 standard 规则，与项目代码最接近
- 使用：
- 安装软件包 npm i
- 运行规范脚本 npm run eslint

#### qqmap-wx-jssdk

- 云函数调用会访问微信小程序位置服务webserviceAPI, 需要在程序敏感文件配置中设置相关字段作为访问的key

- 参考文档: https://lbs.qq.com/miniProgram/jsSdk/jsSdkGuide/jsSdkOverview
