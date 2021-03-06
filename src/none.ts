import Maybe, { MatchType, Nil } from "./maybe";
import { maybe } from "./index";

const isNoArgFunc = <T>(x: any): x is (() => any) => {
    return typeof x === "function" && x.length === 0;
};

const invokeFunc = <T>(funcOrT: T | (() => T)): T => {
    if(isNoArgFunc(funcOrT)) {
        return funcOrT();
    }
    return funcOrT;
};

export default class None<T> extends Maybe<T> {
    protected constructor() { super(null); }

    static none<T>() { return new None<T>(); }

    expect(msg?: string | Error): T {
        if (msg instanceof Error) throw msg;
        throw new Error(msg || 'Expected Maybe to contain non-null value');
    }

    caseOf<R>(funcs: MatchType<T, R>): Maybe<R> {
        return funcs.none ?
            maybe(funcs.none()) :
            this as any;
    }

    map<U>(): Maybe<U> {
        return this as any;
    }

    tap(): Maybe<T> {
        return this;
    }

    flatMap<U>(): Maybe<U> {
        return this as any;
    }

    orElse<U>(def: U | (() => U)): T | U {
        return invokeFunc(def);
    }

    or<U>(other: Maybe<U> | (() => Maybe<U>)): Maybe<T | U> {
        return invokeFunc(other);
    }

    eq(other: Maybe<T>): boolean {
        return other instanceof None;
    }

    join<U, R>(f: (x: T, y: U) => R | Nil, other: Maybe<U>): Maybe<R> {
        return this as any;
    }

    asNullable(): T | null { return null; }
}

const _noneSingleton = None.none<any>();
export const none = <T>(): Maybe<T> => _noneSingleton;
