import { Nullable } from 'simplytyped';
import * as fl from './fantasy-land';

export const binder = <T extends Function>(context: any, f: T): T => f.bind(context); // tslint:disable-line ban-types

export type Nil = null | undefined;

export type NotVoid = object | string | number | boolean | undefined | null;

export interface MatchType<T, R> {
    some?: (v: T) => R;
    none?: () => R;
}

export const isNothing = (thing: any): thing is Nil => {
    return thing === undefined || thing === null;
};

export default abstract class Maybe<T> {
    protected constructor(protected value: Nullable<T>) {}

    static of: <T>(x: T) => Maybe<T>;

    isNothing() { return isNothing(this.value); }

    abstract expect(msg?: string | Error): T;
    abstract caseOf<R>(funcs: MatchType<T, R>): Maybe<R>;
    abstract map<U extends NotVoid>(f: (v: T) => Nullable<U>): Maybe<U>;
    abstract tap(f: (v: T) => void): Maybe<T>;
    abstract flatMap<U>(f: (v: T) => Maybe<U>): Maybe<U>;
    abstract orElse<U>(def: U | (() => U)): T | U;
    abstract or<U>(other: Maybe<U> | (() => Maybe<U>)): Maybe<T | U>;
    abstract eq(other: Maybe<T>): boolean;
    abstract asNullable(): T | null;

    abstract join<U, R extends NotVoid>(f: (x: T, y: U) => R | Nil, other: Maybe<U>): Maybe<R>;

    // Fantasy-land aliases
    static [fl.of]: <T>(x: T) => Maybe<T>;
    [fl.map] = binder(this, this.map);
    [fl.chain] = binder(this, this.flatMap);
    [fl.ap]: <U extends NotVoid>(m: Maybe<(x: T) => U>) => Maybe<U> = m => m.flatMap(f => this.map(f));
}
