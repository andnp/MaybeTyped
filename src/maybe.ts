export type Nil = null | undefined;

export interface MatchType<T, R> {
    some?: (v: T) => R;
    none?: () => R;
}

export const isNothing = (thing: any): thing is Nil => {
    return thing === undefined || thing === null;
};

export default abstract class Maybe<T> {
    protected constructor(protected value: T | Nil) {}

    isNothing() { return isNothing(this.value); }

    abstract expect(msg?: string | Error): T;
    abstract caseOf<R>(funcs: MatchType<T, R>): Maybe<R>;
    abstract map<U>(f: (v: T) => (U | Nil)): Maybe<U>;
    abstract flatMap<U>(f: (v: T) => Maybe<U>): Maybe<U>;
    abstract orElse(def: T | (() => T)): T;
    abstract or(other: Maybe<T> | (() => Maybe<T>)): Maybe<T>;
    abstract asNullable(): T | null;
}
