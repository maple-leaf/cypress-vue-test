import x from '../../call-logger';

describe('rewire', () => {
    before(() => {
        x.__Rewire__('logger', () => 'rewired')
        x.__Rewire__('log', () => 'log rewired')
    })

    it('333', () => {
        expect(x()).to.equal('rewired log rewired');
    });
});
