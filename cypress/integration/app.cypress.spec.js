import App from '../../app.vue';
import { mount, shallowMount } from '@vue/test-utils'

describe('test app shallow', () => {
    let wrapper;
    before(() => {
        wrapper = shallowMount(App);
    });

    it('renders the correct markup', () => {
        expect(wrapper.html()).to.contain('<div>Counter value is 1 now</div>')
    });
});

describe('test app', () => {
    let wrapper;
    before(() => {
        wrapper = mount(App);
    });

    it('button should increment the count', () => {
        expect(wrapper.vm.value).to.equal(1)
        const button = wrapper.find('button');
        button.trigger('click');
        expect(wrapper.vm.value).to.equal(2);
        expect(wrapper.html()).to.contain('<div>Counter value is 2 now</div>')
        wrapper.find('#xx').trigger('click');
        expect(wrapper.vm.items.length).to.equal(2);
    });
});

describe('e2e test for app', () => {
    before(() => {
        cy.visit('/');
    });

    it('should toggle e2etest when click on counter content', () => {
        cy.get('#e2etest').should('have.length', 0);
        cy.get('div:nth-child(2)').contains('Counter value is 1 now').click();
        cy.get('#e2etest').should('have.length', 1);
    });
});
