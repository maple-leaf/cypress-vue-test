import Counter from '../../counter.vue';
import { mount } from '@vue/test-utils'

describe('test counter', () => {
    let wrapper;
    before(() => {
        wrapper = mount(Counter);
    });

    it('renders the correct markup', () => {
        expect(wrapper.html()).to.contain('<span class="count">0</span>')
    })

    it('has a button', () => {
        expect(wrapper.contains('button')).to.be.true;
    })

    it('button should increment the count', () => {
        expect(wrapper.vm.count).to.equal(0);
        const button = wrapper.find('button');
        button.trigger('click');
        expect(wrapper.vm.count).to.equal(1);
    })
});
