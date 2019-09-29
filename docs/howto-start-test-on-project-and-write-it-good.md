## 如何开始测试

### 我负责的项目很老旧，应该怎么开始测试？
项目的年代越旧，历史包袱就越多，不规范的代码也越多。增加测试可以对之后的代码还有重构起到很大的作用。

这类项目测试的开展的一些建议：

- 优先对纯 `js` 并且不涉及 `dom` 操作的函数进行单元测试，这时候的测试很轻量，测试的量也较轻。在这里可以不使用 `cypress`， 而使用 `jest`，但是建议不要，因为后面 `dom` 相关的测试你还是需要回到 `cypress`。有哪些情况是使用正常 `node` 端测试框架（如 `jest`）无法处理的测试场景
- 对项目的主流程做 E2E 测试，这个放在前面是因为这个对项目的稳定起重要的中用
- 接下去对 纯 `js` 并且 涉及 `dom` 操作的函数补充单元测试或者 `E2E` 测试
- 对非业务组件进行单元测试
- 对业务组件测试，根据情况，可以单独做单元测试，也可以放到页面级的 `E2E` 测试中
- 做一些其他有必要的 `E2E` 测试

## 如何写好的测试


### 如何进行带复杂交互的视觉还原测试


当我们在 `cypress` 中测试一些复杂交互，例如 `drag&drop`，往往需要通过 `cy.trigger` 派发浏览器事件进行模拟（参见 [cypress-demo](https://github.com/cypress-io/cypress-example-recipes/tree/master/examples/testing-dom__drag-drop))，这个流程可能会是这样： `点击 -> 记录坐标点 -> cy.trigger -> 点击 -> 记录坐标点 -> cy.trigger -> 如此反复` 可以看到这个流程十分繁琐，如果还需要在其中增加 `keyboradEvent` 或 `viewport` 变化等，会使得测试会更加棘手。

现在有一个 `cypress` 插件用来解决这个问题，它的流程是这样： `安装 chrome 插件 -> 根据文档录制并保存事件信息文件 -> cy.toMatchRepeatSnapshot(事件信息)`. `cypress` 插件会根据前期录制事件信息对其进行回放，并在回放结束后进行截图比对。只要有了事件信息，后续的测试都只需要一条命令就搞定了。

具体使用方式请查看 使用`cypress + cypress-repeat-snapshot` 来做[交互自动化测试和视觉回归测试](https://github.com/maple-leaf/blog/blob/master/articles/visual_test/%E8%A7%86%E8%A7%89%E5%9B%9E%E5%BD%92%E6%B5%8B%E8%AF%95.md)


### 如何测试内部有 import 依赖的模块


假设我们要测试这样一段代码

```javascript
import { getPosts } from 'apis';
 
 
export default {
    request() {
        return getPosts();
    }
}
```


我们希望测试 `request` 函数，其能正常执行并返回预期的结果。由于其自己依赖了 `apis` 里的 `getPosts` 函数的返回，导致很难进行测试。为了能正常的测试我们需要一种方式能够 `mock` 掉 `getPosts` 这个方法，这时候我们可以使用 `babel-plugin-rewire`. 具体我们需要做这几步：

- 安装：`npm i babel-plugin-rewire -D`
- 配置 `babel.config.js`， 在测试环境中使用 `rewire` 插件
- 自定义 `cypress` 命令，其内部自动使用 `rewire` 来 `mock` 对应的实现。

```javascript
// babel.config.js
const presets = ['@babel/env'];
const plugins = [
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-class-properties',
];
if (process.env["ENV"] === "test") {
  plugins.push('istanbul');
  plugins.push('rewire'); // <<<
}
module.exports = {
    presets,
    plugins,
};
```
```javascript
// support/commands.js
Cypress.Commands.add('mock', (target, module, implementation) => {
    if (typeof module !== 'string')
        throw new Error('usage: cy.mock(moduleBeingTested, "axios", () => (["axios is imported in moduleBeingTested, and we can to mock it easy"])');
    target.__Rewire__(module, implementation);
});
```


### 具体测试场景示例

editor-collage-editor.js 实现示例

```javascript
import tinycolor from 'tinycolor2'; // << 我们通过 mock 这个依赖来进行更好的测试

export default {
	isCellBgDark(cell) {
       // 图片默认认为是暗色背景
       if(cell.url) return true;
       if(!cell.backgroundColor) return false;

       return tinycolor(cell.backgroundColor).isDark();
    },
}
```

editor-collage-editor.js 测试示例

```javascript

import EditorCollageEditor from './editor-collage-editor';
describe('mock test', () => {
    before(() => {		
		// 我们这里 mock 的实现是不正确的，只是为了掩饰效果用
		// 实际中我们需要正确的 mock 实现
		// 这里写在 before 里，会导致之后所有的测试都受影响，
        cy.mock(EditorCollageEditor, 'tinycolor', () => ({ isDark: () => false }));

        return cy.mount(EditorCollageEditor, {
            propsData: data,
        }).then(wrapper => {
            component = wrapper;
            vm = component.vm;
        });
    });


    it.only('detect backgroundColor is dark or light color', () => {
        expect(vm.isCellBgDark({ backgroundColor: '#fff' })).to.be.false;
        expect(vm.isCellBgDark({ backgroundColor: '#000' })).to.be.true; // << 错误的 mock 导致失败


		// 如果 before 里没有mock，在实际用例里进行 mock，由于 cy.mock 是异步执行的，所以断言需要在 then 里面写
		cy.mock(EditorCollageEditor, 'tinycolor', () => ({ isDark: () => false }))
		  .then(() => {
 			  expect(vm.isCellBgDark({ backgroundColor: '#fff' })).to.be.false;
        	  expect(vm.isCellBgDark({ backgroundColor: '#000' })).to.be.true; // << 错误的 mock 导致失败
		  });
    });
});
```

### 那么为什么需要 mock 内部依赖呢？

这是为了让我们测试的对象能够有稳定的可预测的符合预期的结果。

我们测试的对象的某些功能是对依赖实现透明的，即不关心依赖内部的实现对不对，只关注依赖能返回预期的结果即可。比如依赖了一个函数，其输出一定是一段字符串，不管内部是不是做了字符串操作等等行为，那么我们就可以 `mock` 其实现为输出 'hello world', 那么调用这个函数的被测试的外部函数的输出也就可以预期了。



### mock 的弊端

虽然 `mock` 可以为我们提供简单话的环境来对目标进行测试，但是由于 `mock` 后的实现是我们控制的正常表现，一旦被 `mock` 的函数修改后，输出已经不一样了，这时候会发生什么：

我们对目标的测试由于 `mock` 是正常的，导致测试正常通过
我们如果对被 `mock` 的模块有自行测试，虽然之前的这部分测试会失败，但是我们只会修正这部分的测试，但是对类似上面的调用方则大概率会忽略掉
这时候我们就会陷入一个问题，我们测试了模块 A 和 B，但是 A 依赖 B， 这时候由于 B 被 `mock` 了，导致 A 和 B 的测试完全隔离了。这时候 __A 正常 + B 正常 != A+B正常__
