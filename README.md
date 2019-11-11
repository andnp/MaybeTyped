# MaybeTyped

[![Build Status](https://travis-ci.org/andnp/MaybeTyped.svg?branch=master)](https://travis-ci.org/andnp/MaybeTyped)
[![Greenkeeper badge](https://badges.greenkeeper.io/andnp/MaybeTyped.svg)](https://greenkeeper.io/)
[![codecov](https://codecov.io/gh/andnp/MaybeTyped/branch/master/graph/badge.svg)](https://codecov.io/gh/andnp/MaybeTyped)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

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

const y = none().flatMap(maybeAdd1); // None
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
export function doThing(): string | null {
    const maybeValue: Maybe<string> = getFromSomewhereInLib();
    return maybeValue.asNullable();
}
```
```typescript
const value = 'hi';
const nullable = maybe(value).asNullable();

assert(nullable === value);
```
