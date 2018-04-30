# MaybeTyped

[![Build Status](https://travis-ci.org/andnp/MaybeTyped.svg?branch=master)](https://travis-ci.org/andnp/MaybeTyped)
[![codecov](https://codecov.io/gh/andnp/MaybeTyped/branch/master/graph/badge.svg)](https://codecov.io/gh/andnp/MaybeTyped)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Known Vulnerabilities](https://snyk.io/test/github/andnp/maybetyped/badge.svg?targetFile=package.json)](https://snyk.io/test/github/andnp/maybetyped?targetFile=package.json)
[![Greenkeeper badge](https://badges.greenkeeper.io/andnp/MaybeTyped.svg)](https://greenkeeper.io/)

MaybeTyped is a well-typed Maybe (optional) monad written in typescript.

`npm install maybetyped`

## Usage Examples
```typescript
import Maybe, { some, none, maybe } from 'maybetyped';

function getUsername(): Maybe<string> {
    return maybe(usernameElement.text());
}

const normalizedUsername =
    getUsername()
        .map(name => name.split(' ')[0])
        .map(name => name.toLowerCase())
        .orElse('username');

// without Maybe
function getUsername(): string | undefined {
    return usernameElement.text();
}

let normalizedUsername = 'username';
const username = getUsername();
if (username !== undefined) {
    const firstName = username.split(' ')[0];
    normalizedUsername = firstName.toLowerCase();
}
```

## Api

### map
Map gives access to the contained value.
Imagine an array, `Array<string>`, as a container for strings, the `map` function applies a function to each element if the container is not empty and gives back a new container.
For instance:
```typescript
const orig: Array<string> = ['1', '2', '3'];
const now: Array<number> = orig.map(x => parseInt(x));
```

```typescript
    some('thing').map(v => console.log(v)) // prints "thing"

    none().map(v => console.log(v)) // does not print
```

### flatMap
FlatMap also accesses the contained value, but it expects that its "mapper" function returns a container of the same type.
Imagine the conceptually equivalent array container:
```typescript
const orig: Array<number> = [1, 3, 5];
const now: Array<number> = orig.flatMap(x => ( [x, x + 1] ));
console.log(now); // => [1, 2, 3, 4, 5, 6]
```
```typescript
const maybeAdd1 = (x: Maybe<number>) => x.map(y => y + 1);

const x = some(2).flatMap(maybeAdd1); // Maybe<3>

const y = none().flatMap(maybeAdd1); // Maybe<undefined>
```

### or
Similar to the `or` logical operator.
Tries to get the value (true) of the first maybe; if it is empty (false), tries to get the value (true) of the second maybe.
If both are empty (false), returns an empty (false) maybe.
```typescript
const first = none();
const second = some(22);

const third = first.or(second); // Maybe<22>
```

### orElse
Similar to `or`, except the second value is not allowed to be empty.
`orElse` _must_ return an instance of the contained value, even if the maybe is empty.
This is useful for supplying default values:
```typescript
const maybeName = maybe(getNameFromInput());
const name = maybeName.orElse('enter name please');
```
```typescript
const first = none<string>();
const second = 'hi';

const third = first.orElse(second); // 'hi';
```

### expect
`expect` forcefully gets the value out of the `Maybe` container, or throws an error if there is no value.
This is useful whenever you _know_ the value must be defined at this point, and you want to get out of the `Maybe` chain.
For instance:
```typescript
function tryOption1(): Maybe<string> { ... }
function tryOption2(): Maybe<string> { ... }
function tryOption3(): Maybe<string> { ... } // The string must be created by one of these 3, we just don't know which

const str: string =
    tryOption1()
        .or(tryOption2)
        .or(tryOption3)
        .expect('We expected to get the from one of these three methods');
```
```typescript
function getData(): Maybe<DataType> { ... }
const maybeData = getData();

const shouldHaveData = maybeData.expect("oops, guess I didn't");
// throws an error with the given message if value is null
// otherwise returns value
```

### caseOf
`caseOf` is a pattern matcher for the `Maybe`.
This is useful when you want to execute different logic dependent on whether the container is empty.
For instance:
```typescript
maybeData.caseOf({
    none: () => attemptToGetFromApi().map(doThingWithData),
    some: data => doThingWithData(data),
});
```
```typescript
getData().caseOf({
    some: value => value + 1,
    none: () => 1,
});
// executes the "some" function if not null
// executes the "none" function if null
```

### asNullable
`asNullable` provides an "out" for escaping the `Maybe` container.
This is particularly useful at the boundaries of your API.
Often the internals of a library use `Maybe` to clean up code, but would like their external contracts to not be forced to use `Maybe`s, but instead "vanilla" JS.
For instance:
```typescript
export function doThing(): string | undefined {
    const maybeValue: Maybe<string> = getFromSomewhereInLib();
    return maybeValue.asNullable();
}
```
```typescript
const value = 'hi';
const nullable = maybe(value).asNullable();

assert(nullable === value);
```

## MaybeT
```typescript
export function apiUserSearch(user: string): MaybeT<Promise<UserData>> {
    // if user does not exist, api returns undefined
    return maybeT(fetch(`some/uri?user=${user}`).json());
}

const userBirthday = await apiUserSearch('yagami')
    .map(user => user.birthday)
    .map(date => new Date(date))
    .orElse(() => Date.now()); // <- this is probably a bad design choice :P

const userBirthdayPromises = maybeT(['misa misa', 'light', null, 'ryuk'])
    .map(apiUserSearch)
    .map(maybeUser =>
        maybeUser
            .map(user => user.birthday)
            .map(date => new Date(date))
            .orElse(() => Date.now()))
    .asNullable();

const userBirthdays = await Promise.all(userBirthdayPromises);
```

## Api

### maybeT
`maybeT` is the constructor for a maybe transform.
Anything with a `map` function can be transformed into a `maybeT`.
Due to the commonality of the use case, support for `thenables` is also added, though be warned that `then` matches `flatMap` semantics, not `map` semantics.
```typescript
const maybeThings = maybeT([1, 2, null, 4, undefined, 6]); // MaybeT<Array<number>>
const maybeLater = maybeT(Promise.resolve('hey')); // MaybeT<Promise<string>>
```

### map
```typescript
const things = maybeT(['1', '2', null, '4']) // MaybeT<Array<string>>
    .map(x => parseInt(x)); // MaybeT<Array<number>>
```

### caseOf
```typescript
const things = maybeT([1, 2, null, 4])
    .caseOf({
        none: () => 4,
        some: x => x + 1,
    }); // MaybeT<Array<number>> => MaybeT<[2, 3, 4, 5]>
```

### orElse
```typescript
const things = maybeT([1, 2, null, 4])
    .orElse(3); // MaybeT<Array<number>> => MaybeT<[1, 2, 3, 4]>
```

### asNullable
```typescript
const things = maybeT([1, 2, null, 4])
    .asNullable(); // Array<number> => [1, 2, null, 4]
```

### asType
Because typescript does not have support for higher-kinded-types (HKT), we lose track of which monad-like HKT we are dealing with (`Array` or `Promise` or other).
This means that after most operations the type will become `MaybeT<MonadLike<*>>`.
To cope with this, we provide an `asType` method that will allow us to properly "remember" what type of monad we were originally dealing with.
A little type safety will be lost here, as you could lie and say this is an `Array` instead of a `Promise`, but the constructor that is passed in to this method will confirm the type at runtime.
This method also asks for the contained type, but because we _haven't_ forgotten that, we will be able to check that.

Programmatic examples below should help make this more clear.
```typescript
const a = maybeT(Promise.resolve('hi'))
    .asType<Promise<string>>(Promise); // Promise<string> => this is correct

const b = maybeT(Promise.resolve('hey'))
    .asType<Array<string>>(Array); // Array<string> => this will throw a runtime err, but not a compile err

const c = maybeT(Promise.resolve('hello'))
    .asType<Promise<number>>(Promise); // any => this will throw a compile err, but not runtime

const d = maybeT(Promise.resolve('merp'))
    .asType<Promise<string>>(Array); // any => this will throw a compile err and runtime
```
