export interface MatchType<T, R> {
    some?: (v: T) => R;
    none?: () => R;
}

export type Nil = null | undefined;

const isNothing = (thing: any): thing is Nil => {
    return thing === undefined || thing === null;
};

export default class Maybe<T> {
    private constructor(private value: T | Nil) {}

    // Constructors
    static none<T>() { return new Maybe<T>(undefined); }
    static some<T>(v: T) { return new Maybe(v); }
    static maybe<T>(v: T | Nil) { return new Maybe(v); }

    isNothing() { return isNothing(this.value); }

    expect(msg?: string | Error): T {
        if (isNothing(this.value)) {
            if (msg instanceof Error) throw msg;
            throw new Error(msg || 'Expected Maybe to contain non-null value');
        }
        return this.value;
    }

    caseOf<R>(funcs: MatchType<T, R>): Maybe<R> {
        if (isNothing(this.value)) {
            return funcs.none ?
                Maybe.maybe(funcs.none()) :
                this as any;
        }

        return funcs.some ?
            Maybe.maybe(funcs.some(this.value)) :
            Maybe.none();
    }

    map<U>(f: (v: T) => (U | Nil)): Maybe<U> {
        return isNothing(this.value) ?
            this as any :
            Maybe.maybe<U>(f(this.value));
    }

    flatMap<U>(f: (v: T) => Maybe<U>): Maybe<U> {
        return isNothing(this.value) ?
            this as any :
            f(this.value);
    }

    orElse(def: T | (() => T)): T {
        if (!isNothing(this.value)) return this.value;

        return typeof def === 'function' ?
            def() :
            def;
    }

    or(other: Maybe<T> | (() => Maybe<T>)): Maybe<T> {
        if (!isNothing(this.value)) return this;

        return typeof other === 'function' ?
            other() :
            other;
    }

    asNullable(): T | Nil {
        return this.value;
    }
}

export const maybe = Maybe.maybe;
export const some = Maybe.some;
export const none = Maybe.none;
