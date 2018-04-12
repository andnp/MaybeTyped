import Maybe, { Nil, isNothing } from './maybe';
import { some } from './some';
import { none } from './none';

export const maybe = <T>(value: T | Nil): Maybe<T> => isNothing(value)
    ? none()
    : some(value);


export { some } from './some';
export { none } from './none';

export default Maybe;
