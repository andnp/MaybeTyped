import Maybe, { MatchType, Nil } from "./maybe";
import { maybe } from "index";

export default class None<T> extends Maybe<T> {
    protected constructor() { super(null); }

    static none<T>() { return new None<T>(); }

    expect(msg?: string | Error) {
        if (msg instanceof Error) throw msg;
        throw new Error(msg || 'Expected Maybe to contain non-null value');

        // @ts-ignore -- need to return type T, but this is unreachable code
        return this.value!;
    }

    caseOf<R>(funcs: MatchType<T, R>): Maybe<R> {
        return funcs.none ?
            maybe(funcs.none()) :
            this as any;
    }

    map<U>(f: (v: T) => (U | Nil)): Maybe<U> {
        return this as any;
    }

    flatMap<U>(f: (v: T) => Maybe<U>): Maybe<U> {
        return this as any;
    }

    orElse(def: T | (() => T)): T {
        return typeof def === 'function'
            ? def()
            : def;
    }

    or(other: Maybe<T> | (() => Maybe<T>)): Maybe<T> {
        return typeof other === 'function'
            ? other()
            : other;
    }

    asNullable(): T | null { return null; }
}

export const none = None.none;
