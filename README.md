## 现状与本人推荐


目前有很多测试框架（jest，cypress，ava，mocha等），也有很多测试方式（unit test, e2e test, integration test, functional test，关于这些的具体介绍和框架有兴趣的可以查看 https://medium.com/welldone-software/an-overview-of-javascript-testing-in-2019-264e19514d0a)，所以什么样的测试比较符合我们的需要？



目前个人认为是使用cypress进行 unit test + e2e test，不使用其他多余的框架，一站式稿定 unit + e2e，而 unit + e2e 应该已经可以满足目前测试所需，其他的测试方式是一些变种和多样测试来保证测试的完整性而已。



## 那么为什么选择cypress？
优点：

- 保证测试与最终环境的一致性: 在cypress上面跑的测试代码是在浏览器环境上的，而非像jest等在node上的

- 统一测试代码风格、测试环境，避免技术负担: 本身定位 e2e, 但是支持 unit test。使用同一个框架来进行避免冲突和学习成本。另外由于cypress在浏览器环境上运行，测试dom相关无需各种mock（如node-canvas等）

- 支持 CI 环境，另外其electron安装包安装后会放在cache目录，之后的安装会优先使用cache内的版本，不会导致CI环境上不同项目测试时重复安装

- cypress提供插件能力（node代码）和扩展能力（chrome的extension），可以根据需要自定义行为和功能

- 支持 parallel test

缺点：

- 目前只支持chrome内核的环境（chrome, chromium, electron)


## Quick Start Guide
### vue 的 cypress 测试脚手架
cypress 测试脚手架可以参考：https://github.com/maple-leaf/cypress-vue-test


### 安装
- cypress(第一次安装需要下载eletron，会较久): npm install cypress -D

- vue 的 unit test 工具: npm install @vue/test-utils -D

    > 示例的脚手架使用 vue 的官方 @vue/test-utils 来进行 unit test。 另外还有一个第三方的 https://github.com/bahmutov/cypress-vue-unit-test 第三方的差异在于其实际是创建了一个dom，并将测试的实例初始化到这个dom内，也就是我们通常写的 new Vue({ el: '#xxx' ....}) 所以没办法实现 shallowMount。两者均可正常测试，测试方式不同而已，请根据自己实际需要来选择。

### 配置 cypress

- 创建配置文件 cypress.json

```
    {
      "baseUrl": "http://localhost:8080",
      "coverageFolder": "coverage",
      "integrationFolder": "src",
      "testFiles": "**/*.cypress.spec.js",
      "video": false,
      "viewportHeight": 900,
      "viewportWidth": 1600
    }
```

- 配置测试覆盖率：由于 cypress 本身尚未提供测试覆盖率统计，因此我们需要通过配置 babel 使用 istanbul 和加入统计逻辑到 cypress 的插件体系内

    - 安装 babel-plugin-istanbul: `npm install babel-plugin-istanbul -D`

    - 根据脚手架示例修改 [babel.config.js](https://github.com/maple-leaf/cypress-vue-test/blob/master/babel.config.js#L3) ,  [cypress/plugins/index.js](https://github.com/maple-leaf/cypress-vue-test/blob/master/cypress/plugins/index.js#L17) ,  [cypress/support/index.js](https://github.com/maple-leaf/cypress-vue-test/blob/master/cypress/support/index.js#L18) , 添加文件 [cypress/support/istanbul.js](https://github.com/maple-leaf/cypress-vue-test/blob/master/cypress/support/istanbul.js)

- 配置 package.json 测试相关 script

```
    "scripts": {
      "cy:run": "cypress run",
      "cy:open": "cypress open",
      "dev": "ENV='test' start-server-and-test serve http-get://localhost:8080 cy:open",
      "serve": "webpack-dev-server --hot --config webpack.dev.js",
      "coverage": "nyc report -t=coverage",
      "test": "rm -rf coverage && start-server-and-test serve http-get://localhost:8080 cy:run && nyc report -t=coverage",
    },
```

   * 这里我们需要额外安装两个工具：npm install start-server-and-test  nyc -D

       - start-server-and-test 用于多个script的串联操作，比如我们在 npm run dev 内启动了 webpack-dev-server， 服务启动后我们打开了 cypress 的测试工具

       - nyc 是 istanbul 的统计工具，用于生成测试覆盖率报告

   * cypress 我们配置了两个命令。 ⚠️ cypress要求配置里的 baseUrl 服务可用，所以请确保单独运行下面两个之前，webpack-dev-server已经运行

       - 无GUI环境运行cypress，一般用于CI环境：npm run cy:run

       - GUI环境：npm run cy:open



### 书写代码和测试用例：该配置要求 cypress 的测试文件和被测试的源文件放在同一目录内, 并且测试文件以 cypress.spec.js 结尾

```
 src

       components

           a-component.vue

           a-component.cypress.spec.js

       libs

           x.js

           x.cypress.spec.js
```

### 使用cypress运行测试用例 （这里只展示GUI环境，CI环境直接运行 npm run test 即可)

![cypress界面](https://mmbiz.qpic.cn/mmbiz_png/V9sBNmNYPS76Qka8z0yj4ibwHcpQCc7qHjcdONIQblzricDYlBRjrS8PDCu7c8rHdNnLiaNK9w7Qrv5GEz1CyPvpg/640?wx_fmt=png)



PS: 关于vue cli的独特配置问题请参考 https://github.com/bahmutov/cypress-vue-unit-test#vue-cli。

