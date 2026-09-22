import { parse_errors } from './broutil';

describe('parse_errors', () => {
  it('returns an empty object when there is nothing to parse', () => {
    expect(parse_errors('')).toEqual({});
    expect(parse_errors('all good, nothing to see here')).toEqual({});
  });

  it('parses an error line into a 0-based annotation', () => {
    const errors = parse_errors('error in /foo.zeek, line 5: something broke');
    expect(errors['foo.zeek']).toEqual([
      { row: 4, column: 0, type: 'error', text: 'something broke' },
    ]);
  });

  it('parses warnings too', () => {
    const errors = parse_errors('warning in /foo.zeek, line 1: heads up');
    expect(errors['foo.zeek']).toEqual([{ type: 'warning', text: 'heads up', row: 0, column: 0 }]);
  });

  it('rewrites try.zeek to main.zeek and strips leading slashes/dots', () => {
    const errors = parse_errors('error in ./try.zeek, line 2: oops');
    expect(errors['main.zeek']).toEqual([
      { row: 1, column: 0, type: 'error', text: 'oops' },
    ]);
  });

  it('groups multiple errors by file', () => {
    const stderr = [
      'error in /a.zeek, line 1: first',
      'error in /a.zeek, line 3: second',
      'warning in /b.zeek, line 9: third',
    ].join('\n');
    const errors = parse_errors(stderr);
    expect(errors['a.zeek']).toEqual([
      { row: 0, column: 0, type: 'error', text: 'first' },
      { row: 2, column: 0, type: 'error', text: 'second' },
    ]);
    expect(errors['b.zeek']).toEqual([
      { row: 8, column: 0, type: 'warning', text: 'third' },
    ]);
  });
});
