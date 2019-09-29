### 如何快速入门Cypress
[官方引导文档](https://docs.cypress.io/guides/getting-started/writing-your-first-test.html)来一遍，整体看一遍时间大概1小时内
Cypress 使用了 Chai 风格的断言，可以大概看一遍[断言文档](https://docs.cypress.io/guides/references/assertions.html#Chai)
其他总结文档：[cypress-tips-and-tricks](https://glebbahmutov.com/blog/cypress-tips-and-tricks/)


### 测试时候对请求 mock 很麻烦
mock数据很麻烦这点应该是无解的，所以我们看下这样的操作有什么好处：

可以自行定义数据，控制请求返回。可以避免开发的时候想验证一些情况，但是开发环境的数据没有的情况，需要另外去构造，而这个构造过程可能还需要后端配合，整个过程极端情况下可能会变成不可能，导致不得不到线上环境测试或者不测试
脱离后端服务环境来开发和测试。偶尔我们会碰到后端的代码有问题或者开发服务突然挂掉，这时候我们如果需要接口返回正常结果才能开发或者测试就会很被动，mock则解决了此问题。
所以 mock 的益处是大于麻烦这个弊端的，接下来我们也许可以这么处理来避免麻烦：

我们可以尝试统一建立一个 mock 服务，该服务应该可以

- 建对应项目
- 建接口 schema
- schema 可以有正常和异常的情况
- 服务被请求后，可以自己根据 schema 生成数据

然后我们本地可以有一个 proxy，可以在测试代码内轻松的代理请求到 mock 服务。

如果可能的话，mock 服务可以直接作为前后端接口定义的 schema 服务，作为规范和文档


### 有哪些情况是使用正常 node 端测试框架（如 jest）无法处理的测试场景？
虽然 node 端有 jsdom 这个 mock 库，但是其并不负责渲染，因此很多和 dom 渲染相关的测试基本无解，比如滚动条相关的测试（scrollWidth, scrollHeight 等)、getBoundingClientRect 等，这些如果一定要测试需要自己再另外 mock，一是麻烦，而是这样无法保证实际执行环境的预期。
