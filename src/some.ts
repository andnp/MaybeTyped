import { Nullable } from 'simplytyped';
import Maybe, { MatchType, NotVoid } from "./maybe";
import { maybe, none } from "./index";

export default class Some<T> extends Maybe<T> {
    static some<T>(thing: T) { return new Some<T>(thing); }

    expect() { return this.value!; }

    caseOf<R>(funcs: MatchType<T, R>): Maybe<R> {
        return funcs.some
            ? maybe<R>(funcs.some(this.value!))
            : none<R>();
    }

    map<U>(f: (v: T) => Nullable<U>): Maybe<U> {
        return maybe<U>(f(this.value!));
    }

    tap(f: (v: T) => void): Maybe<T> {
        f(this.value!);
        return this;
    }


    flatMap<U>(f: (v: T) => Maybe<U>): Maybe<U> {
        return f(this.value!);
    }

    orElse<U>(def: U | (() => U)): T | U {
        return this.value!;
    }

    or<U>(other: Maybe<U> | (() => Maybe<U>)): Maybe<T | U> {
        return this;
    }

    eq(other: Maybe<T>): boolean {
        return other.map(v => v === this.value)
            .orElse(false);
    }

    join<U, R extends NotVoid>(f: (x: T, y: U) => Nullable<R>, other: Maybe<U>): Maybe<R> {
        return this.flatMap(x => other.map(y => f(x, y)));
    }

    asNullable(): T | null {
        return this.value!;
    }
}

export const some: <T>(x: T) => Maybe<T> = Some.some;
