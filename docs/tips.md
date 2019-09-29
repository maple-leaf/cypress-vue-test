### 测试挂在vue component实例上的eventBus
定制 cy.mount 命令，并在其内部做时间监听和转发

```javascript
// cypress/support/index.js
Cypress.Commands.add('mount', (_component, options = {}) => {
 
    const wrapper = mount(component, options);
 
    // 由于编辑器内部使用了 eventBus， 因此为了测试方便，捕获 eventBus 的事件并在当前 component 上触发
    const _emit = wrapper.vm.$events.$emit;
    wrapper.vm.$events.$emit = function(...args) {
        _emit.apply(wrapper.vm.$events, args);
        wrapper.vm.$emit.apply(wrapper, args);
    }.bind(wrapper.vm); // eslint-disable-line
 
    return wrapper;
});
```
实际测试代码

```javascript
it('zoom cell', () => {
    const snapshotEvt = component.emitted('editor.snapshot.create');
    const snapshotEvtLen = snapshotEvt.length;
    component.vm.$events.$emit('editor.cell.zoom', component.vm.model, 1.2);
    expect(snapshotEvt.length).to.equal(snapshotEvtLen + 1);  // <== 上面的代码会触发component的内部逻辑，从而触发 snapshot 事件，事件数 + 1
})
```


### 如何减少 then 无限嵌套？
- 尽可能使用cy包裹的命令，每一个cy命令都会等待上一个执行完毕，如果写非cy的代码会立即执行，不等待上一个异步cy的执行。
- 使用自定义命令时，如果不需要返回值，那么调用的时候不需要使用then
- 使用共享变量来避免then内嵌套then

优化前

```javascript
it.only('drag image to cell gap', () => {
        cy.loadTpl() // custom comand to do some prepare
        .then(() => {
            editor.currentElement = editor.currentLayout.elements[0];
            const zoom = editor.zoom;
            cy.nextTick().then(() => { // nextTick is just a command to cy.wait(same time)
                cy.get('.editor-toolbar-btn .icon-edit').click();
                cy.get('.editor-collage-editor')
                    .then(jqDom => jqDom.first())
                    .then(dom => {
                        const vm = dom[0].__vue__;
                        const renderElements = vm.renderElements;
                        const secondCell = renderElements[1];
                        cy.get('.editor-element-cell-ghost:last-child')
                            .boundingRect() // custom command to calcuate element boundingClientRect
                            .then(rect => {
                                cy.get('.editor-element-cell-ghost:first-child')
                                    .dragTo({
                                        x: rect.left -2,
                                        y: rect.top + rect.height / 2,
                                    }, false)
                                    .then(() => {
                                        cy.get('.editor-drag-gap-placeholder')
                                            .style()
                                            .then(style => {
                                                expect(style.width).to.equal(4);
                                                expect(style.height).to.not.equal(secondCell.height * zoom);
                                                expect(style.left).lessThan(secondCell.left * zoom);
                                                expect(style.top).equal(secondCell.top * zoom);
                                            });
                                    });
                            });
                    });
            });
        });
    });
```

优化后

```javascript
it.only('drag image to cell gap', () => {
    let zoom, vm, renderElements, secondCell;
    cy.loadTpl().then(() => {
        editor.currentElement = editor.currentLayout.elements[0];
        zoom = editor.zoom;
    });
    cy.nextTick();
    cy.get('.editor-toolbar-btn .icon-edit').click();
    cy.get('.editor-collage-editor')
        .invoke('first')
        .then(dom => {
            vm = dom[0].__vue__;
            renderElements = vm.renderElements;
            secondCell = renderElements[1];
        });
    cy.get('.editor-element-cell-ghost:last-child')
        .boundingRect()
        .then(rect => {
            cy.get('.editor-element-cell-ghost:first-child')
                .dragTo({
                    x: rect.left -2,
                    y: rect.top + rect.height / 2,
                }, false);
            cy.get('.editor-drag-gap-placeholder')
                .style()
                .then(style => {
                    expect(style.width).to.equal(4);
                    expect(style.height).to.not.equal(secondCell.height * zoom);
                    expect(style.left).lessThan(secondCell.left * zoom);
                    expect(style.top).equal(secondCell.top * zoom);
                });
        });
});
```

### 对象比对之同一个对象和数据相等


```javascript
it('equal test', () => {
    const a = [1, 2];
    const b = a;
    const c = [1, 2];
    expect(a).to.equal(b); // 同一个
    expect(a).to.not.equal(c); // 不是同一个
    expect(a).to.eql(c); // 数据一样
});
```



### E2E 测试如何测试事件
被测试代码

```javascript
export default {
....
	methods: {
		...,
        flipCell(dir) {
            if(!this.currentCell) return;
 
            this.$events.$emit('editor.cell.flip', this.currentCell, dir);
        },
	}
}
```
测试代码

```javascript
describe('test event', () => {
    it('flip cell', () => {
        const flipCb = cy.stub();
        editor.$events.$on('editor.cell.flip', flipCb);
        cy.get('.editor-element-collage').click();
        cy.eval(() => editor.flipCell()).then(() => expect(flipCb).not.be.called);

        cy.get('.editor-toolbar-collage .icon-edit').click();
        cy.get('.editor-element-cell-ghost').first().click(); // <- currentCell赋值
        cy.nextTick(300);
        cy.eval(() => editor.flipCell()).then(() => expect(flipCb).to.be.called);
    });
});
```
