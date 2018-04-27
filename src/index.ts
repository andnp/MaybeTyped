import Maybe, { Nil, isNothing } from './maybe';
import * as fl from './fantasy-land';
import { some } from './some';
import { none } from './none';

export const maybe = <T>(value: T | Nil): Maybe<T> => isNothing(value)
    ? none()
    : some(value);

// gotta do this here to get around circular imports
Maybe.of = maybe;
Maybe[fl.of] = maybe;

export { some } from './some';
export { none } from './none';

export default Maybe;
