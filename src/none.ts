import Maybe, { MatchType } from "./maybe";
import { maybe } from "./index";

const invokeFunc = <T>(funcOrT: T | (() => T)): T => {
    if(typeof funcOrT === "function") {
        return funcOrT();
    }
    return funcOrT;
};

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

    map<U>(): Maybe<U> {
        return this as any;
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

    asNullable(): T | null { return null; }
}

export const none: <T>() => Maybe<T> = None.none;
