// https://github.com/cypress-io/cypress/issues/346#issuecomment-365220178
// https://github.com/cypress-io/cypress/issues/346#issuecomment-368832585
const istanbul = require('istanbul-lib-coverage');

const map = istanbul.createCoverageMap({});
const coverageFolder = Cypress.config('coverageFolder');
const coverageFile = `${ coverageFolder }/out-${Date.now()}.json`;

Cypress.on('window:before:unload', e => {
    const coverage = e.currentTarget.__coverage__;

    if (coverage) {
        map.merge(coverage);
    }
});

after(() => {
    cy.window().then(win => {
        const specWin = win.parent.document.querySelector('iframe[id~="Spec:"]').contentWindow;
        const unitCoverage = specWin.__coverage__;
        const coverage = win.__coverage__;

        if (unitCoverage) {
            map.merge(unitCoverage);
        }

        if (coverage) {
            map.merge(coverage);
        }

        cy.writeFile(coverageFile, JSON.stringify(map));
        cy.exec('npx nyc report --reporter=html -t=coverage')
        cy.exec('npm run coverage')
            .then(coverage => {
                // output coverage report
                const out = coverage.stdout
                    // 替换bash红色标识符
                    .replace(/\[31;1m/g, '')
                    .replace(/\[0m/g, '')
                    // 替换粗体标识符
                    .replace(/\[3[23];1m/g, '');
                console.log(out);
            })
            .then(() => {
                // output html file link to current test report
                const link = Cypress.spec.absolute
                    .replace(Cypress.spec.relative, `${coverageFolder}/${Cypress.spec.relative}`)
                    .replace('cypress.spec.', '');
                console.log(`check coverage detail: file://${link}.html`);
            });
    });
});
