import { AnyFunc } from 'simplytyped';
import Maybe, { maybe, none, some } from '../src';

// -------
// Helpers
// -------
const execEach = (...args: AnyFunc[]) => () => args.forEach(arg => arg());
const noop = () => { /* stub */ };
const raiseError = () => {
    throw new Error('oops');
};

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

    definitely.map(v => expect(v).toBe(value));
});

test('Does not call map function when contained value is nil', () => {
    none().map(raiseError);
});

test('map - Gives back a maybe', checkInstance(
    none().map(noop),
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
        none: () => expect(true).toBe(true),
    });
});
