const util = require('./../src/utility');

test('isXpressoProject', () => {
    const isXpressoProject = util.isXpressoProject();

    expect(isXpressoProject).toBeFalsy();
});
