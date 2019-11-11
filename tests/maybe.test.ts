import Maybe, { maybe, none, some } from '../src';

// -------
// Helpers
// -------
const execEach = (...args: Array<() => any>) => () => args.forEach(arg => arg());
const noop = () => null;
const raiseError = () => {
    throw new Error('oops');
};
const pass = () => expect(true).toBe(true);
const fail = () => expect(true).toBe(false);

const checkInstance = (thing: Maybe<any>) => () => expect(thing instanceof Maybe).toBe(true);

// --------
// Creators
// --------

test('Creates an instance of Maybe', execEach(
    checkInstance( maybe(null) ),
    checkInstance( maybe(undefined) ),
    checkInstance( maybe('merp') ),

    checkInstance( none() ),

    checkInstance( some('merp') ),
    checkInstance( some(22) ),
));

// ---
// Map
// ---

test('Calls map function when contained value is non-nil', () => {
    expect.assertions(1);

    const value = "i'm not nil";
    const definitely = some(value);

    // `void` to avoid passing void function to map
    definitely.map(v => void expect(v).toBe(value));
});

test('Does not call map function when contained value is nil', () => {
    none().map(raiseError);
});

test('map - Gives back a maybe', checkInstance(
    none().map(noop),
));

// ---
// Tap
// ---

test('Calls map function when contained value is non-nil', () => {
    expect.assertions(2);

    const value = "i'm not nil";
    const definitely = some(value);

    definitely
        .tap(v => expect(v).toBe(value))
        .tap(v => expect(v).toBe(value));
});

test('Does not call tap function when contained value is nil', () => {
    none().tap(raiseError);
});

test('tap - Gives back a maybe', checkInstance(
    none().tap(noop),
));

// --------
// Flat Map
// --------

test('Calls flatMap function when non-nil', () => {
    expect.assertions(1);

    const value = "imma value";
    const definitely = some(value);

    definitely.flatMap(v => {
        expect(v).toBe(value);
        return none();
    });
});

test('Does not call flatMap function when nil', () => {
    none().flatMap(raiseError);
});

test('flatMap - Gives back a maybe', checkInstance(
    none().flatMap(() => none()),
));

// ------
// Expect
// ------

test('expect - Gives back value when non-nil', () => {
    const value = 'hey';

    const got = some(value).expect();

    expect(got).toBe(value);
});

test('expect - Throws error when nil', () => {
    expect(() => {
        none().expect();
    }).toThrow();
});

test('expect - Throws specified message when nil', () => {
    expect(() => {
        none().expect('oops....');
    }).toThrow('oops....');
});

test('expect - Throws specified error when nil', () => {
    expect(() => {
        none().expect(new Error('uh-oh'));
    }).toThrowError('uh-oh');
});

// --
// or
// --

test('or - gives own value if non-nil', () => {
    const value = 'merp';

    const got = some(value)
        .or(some('other value'))
        .asNullable();

    expect(got).toBe(value);
});

test('or - gives other value when nil', () => {
    const otherValue = 'merp';

    const got = none()
        .or(some(otherValue))
        .asNullable();

    expect(got).toBe(otherValue);
});

test('or - gives result of other function when nil', () => {
    const otherValue = 'merp';

    const got = none()
        .or(() => some(otherValue))
        .asNullable();

    expect(got).toBe(otherValue);
});

test('or - gives back a maybe', checkInstance(
    none().or(none()),
));

// ------
// orElse
// ------

test('orElse - gives own value if non-nil', () => {
    const value = 'hey there';

    const got = some(value).orElse('other value');

    expect(got).toBe(value);
});

test('orElse - gives other value if nil', () => {
    const otherValue = 'hi';

    const got = none().orElse(otherValue);

    expect(got).toBe(otherValue);
});

test('orElse - gives result of other function when nil', () => {
    const otherValue = 'hi';

    const got = none().orElse(() => otherValue);

    expect(got).toBe(otherValue);
});

// ------
// caseOf
// ------

test('caseOf - calls "some" function when non-nil', () => {
    expect.assertions(1);
    const value = 'hey';

    some(value).caseOf({
        some: v => expect(v).toBe(value),
        none: raiseError,
    });
});

test('caseOf - calls "none" function when nil', () => {
    expect.assertions(1);

    none().caseOf({
        some: raiseError,
        none: () => pass(),
    });
});

test('caseOf - can be provided subset of matcher functions', () => {
    expect.assertions(2);

    some('hey').caseOf({
        none: raiseError,
    });

    none().caseOf({
        some: raiseError,
    });

    some('hey').caseOf({
        some: v => expect(v).toBe('hey'),
    });

    none().caseOf({
        none: () => pass(),
    });
});

// ------
// eq
// ------

test('eq - none is not `eq` to some', () => {
    expect.assertions(1);

    expect(none().eq(some("anything"))).toBe(false);
});

test('eq - none is `eq` to none', () => {
    expect.assertions(1);

    expect(none().eq(none())).toBe(true);
});

test('eq - some is `eq` to some if the contents are ===', () => {
    expect.assertions(2);

    const x = {};
    expect(some(x).eq(some(x))).toBe(true);
    // Not same object, not ====
    expect(some(x).eq(some({}))).toBe(false);
});

// ----
// join
// ----

test('join - calls f if both sides are some', () => {
    expect.assertions(1);

    const x = some('hi ');
    const y = some('there');

    const z = x.join((a, b) => a + b, y);

    z.tap(c => expect(c).toBe('hi there'));
});

test('join - does not call f if either side is none', () => {
    expect.assertions(3);

    const left = some('hi');
    const right = none<string>();
    const middle = none<string>();

    const z1 = left.join((a, b) => a + b, right);
    const z2 = right.join((a, b) => a + b, left);
    const z3 = right.join((a, b) => a + b, middle);

    z1.tap(fail).orElse(pass);
    z2.tap(fail).orElse(pass);
    z3.tap(fail).orElse(pass);
});

// -------
// Fantasy
// -------

test('fantasy-land/map - calls into the map method', () => {
    expect.assertions(1);

    const value = "i'm not nil";
    const definitely = some(value);

    // `void` to avoid passing void function to map
    definitely["fantasy-land/map"](v => void expect(v).toBe(value));
});
