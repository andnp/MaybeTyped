import Maybe, { MatchType, Nil } from "./maybe";
import { maybe, none } from "./index";

export default class Some<T> extends Maybe<T> {
    static some<T>(thing: T) { return new Some<T>(thing); }

    expect() { return this.value!; }

    caseOf<R>(funcs: MatchType<T, R>): Maybe<R> {
        return funcs.some
            ? maybe<R>(funcs.some(this.value!))
            : none<R>();
    }

    map<U>(f: (v: T) => (U | Nil)): Maybe<U> {
        return maybe<U>(f(this.value!));
    }

    flatMap<U>(f: (v: T) => Maybe<U>): Maybe<U> {
        return f(this.value!);
    }

    orElse(def: T | (() => T)): T {
        return this.value!;
    }

    or(other: Maybe<T> | (() => Maybe<T>)): Maybe<T> {
        return this;
    }

    eq(other: Maybe<T>): boolean {
        return other.map(v => v === this.value)
            .orElse(false);
    }

    asNullable(): T | null {
        return this.value!;
    }
}

export const some: <T>(x: T) => Maybe<T> = Some.some;
