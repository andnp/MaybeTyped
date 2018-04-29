import { maybeT } from '../src';

test('array - can generate a maybeT', () => {
    const raw = [1, 2, null, undefined, 5];
    const x = maybeT(raw);
    const got = x.asNullable();

    expect(got).toEqual(raw);
});

test('array - can map function over non-nil elements in array', () => {
    const x = maybeT([1, null, 1, undefined, 1]);

    const y = x.map(v => {
        expect(v).toBe(1);
        return 2;
    }).asNullable();

    expect(y).toEqual([2, null, 2, null, 2]);
});

test('array - can get back array type from maybeT', () => {
    const x = maybeT(['1', '2', null, '4']);

    const y = x
        .map(v => parseInt(v))
        .map(v => v + 1)
        .asType<Array<number | null>>(Array);

    expect(y).toEqual([2, 3, null, 5]);
});

test('array - cannot get back wrong monadic type', () => {
    const x = maybeT(['hi']);

    expect(() => {
        x.asType<Promise<string>>(Promise);
    }).toThrowError();
});

test('array - can pattern match over values', () => {
    const x = maybeT(['1', '2', null, '4']);

    const y = x
        .caseOf({
            none: () => 3,
            some: v => parseInt(v),
        })
        .asNullable();

    expect(y).toEqual([1, 2, 3, 4]);
});

test('array - can default null values', () => {
    const x = maybeT([1, 2, null, 4]);

    const y = x.orElse(3);

    expect(y).toEqual([1, 2, 3, 4]);
});

test('promise - can generate a maybeT', async () => {
    const value = 'hi';
    const x = maybeT(Promise.resolve(value));

    const got = await x.asNullable();

    expect(got).toBe(value);
});

test('promise - cannot create maybe with rejected promise', async () => {
    expect.assertions(1);
    const value = 'hey';
    const x = maybeT(Promise.reject(value));

    try {
        await x.asNullable();
    } catch (e) {
        expect(e).toBe(value);
    }
});

test('promise - can map function over non-nil value', async () => {
    const x = maybeT(Promise.resolve('hey'));

    const got = await x
        .map(v => v + ' there')
        .asType<Promise<string | null>>(Promise);

    expect(got).toBe('hey there');
});

test('promise - will not map function over nil values', async () => {
    const x = maybeT(Promise.resolve(null));

    const got = await x
        .map(v => {
            throw new Error("I shouldn't be here!");
        }).asNullable();

    expect(got).toBe(null);
});
