const util = require('./../src/utility');

test('isXpressoProject', () => {
    const isXpressoProject = util.isXpressoProject();

    expect(isXpressoProject).toBeFalsy();
});

test('generateNames', () => {
    const name = 'comics-Manager-portal';

    const names = util.generateNames(name);

    expect(names.projectName).toEqual('comics-manager-portal');
    expect(names.projectPackageName).toEqual('comicsManagerPortal');
});
