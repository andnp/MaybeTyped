# MaybeTyped

[![Build Status](https://travis-ci.org/andnp/MaybeTyped.svg?branch=master)](https://travis-ci.org/andnp/MaybeTyped)
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
if (username === undefined) {
    const firstName = username.split(' ')[0];
    normalizedUsername = firstName.toLowerCase();
}
```

## Api

### map
```typescript
    some('thing').map(v => console.log(v)) // prints "thing"

    none().map(v => console.log(v)) // does not print
```

### flatMap
```typescript
const maybeAdd1 = (x: Maybe<number>) => x.map(y => y + 1);

const x = some(2).flatMap(maybeAdd1); // Maybe<3>

const y = none().flatMap(maybeAdd1); // Maybe<undefined>
```

### or
```typescript
const first = none();
const second = some(22);

const third = first.or(second); // Maybe<22>
```

### orElse
```typescript
const first = none<string>();
const second = 'hi';

const third = first.orElse(second); // 'hi';
```

### expect
```typescript
function getData(): Maybe<DataType> { ... }
const maybeData = getData();

const shouldHaveData = maybeData.expect("oops, guess I didn't");
// throws an error with the given message if value is null
// otherwise returns value
```

### caseOf
```typescript
getData().caseOf({
    some: value => value + 1,
    none: () => 1,
});
// executes the "some" function if not null
// executes the "none" function if null
```

### asNullable
```typescript
const value = 'hi';
const nullable = maybe(value).asNullable();

assert(nullable === value);
```
