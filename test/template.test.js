const { readFileSync } = require('fs');
const { resolve } = require('path');
const Template = require('../lib/template');

/*
 * Template.fromFile
 */
describe('.fromFile', () => {
  test('creates new instance from a file path', () => {
    const filePath = resolve(__dirname, 'fixtures/basic.html');
    const template = Template.fromFile(filePath);
    const html = readFileSync(filePath, 'utf-8');

    expect(html).toEqual(template.html);
  });
});

/*
 * template.parse
 */
describe('#parse', () => {
  test('puts fields into separate branches', () => {
    const html = `
      {{name}}
      {{#section about}}
        {{name}}
        {{bio}}
      {{/section}}`;
    const tree = new Template(html).parse();

    expect(tree).toMatchSnapshot();
  });

  test('allow sections without keyword', () => {
    const withKeyword = new Template('{{#section about}}{{/section}}').parse();
    const withoutKeyword = new Template('{{#about}}{{/about}}').parse();

    expect(withKeyword['section about'].name).toEqual(withoutKeyword.about.name);
  });

  /* eslint-disable quotes */
  test('parses parameters with optional quotes', () => {
    const plain = new Template('{{test required=false}}').parse();
    const single = new Template(`{{test required='false'}}`).parse();
    const double = new Template('{{test required="false"}}').parse();

    expect(plain.general.fields['test required=false']).toEqual(single.general.fields[`test required='false'`]);
    expect(plain.general.fields['test required=false']).toEqual(double.general.fields['test required="false"']);
  });

  test('parses parameters with escaped quotes', () => {
    const inTheMiddle = new Template(`{{test placeholder="Testing \\"quotes\\" in the middle."}}`).parse();
    const mixed = new Template(`{{test placeholder="If this'll work"}}`).parse();

    expect(inTheMiddle).toMatchSnapshot();
    expect(mixed).toMatchSnapshot();
  });
  /* eslint-enable quotes */
});

/*
 * template.render
 */
describe('#render', () => {
  test('replaces tags with content', () => {
    const template = new Template('Hello, {{name}}.');
    const rendered = template.render({ general: { name: 'World' } });

    expect(rendered).toMatchSnapshot();
  });
});