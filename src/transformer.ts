import { ConstructorFor, Nullable } from 'simplytyped';
// @ts-ignore
import Maybe, { MatchType, Nil, NotVoid } from './maybe';
import { maybe } from './index';

export interface Monad<T> {
    map: <U>(f: (v: T) => Nullable<U>) => any;
}

export type MonadLike<T> = Monad<T> | PromiseLike<T>;
export type MonadValue<T extends MonadLike<any>> =
    T extends PromiseLike<infer U> ? U :
    T extends Monad<infer U> ? U : never;

export type MaybeValue<T extends MonadLike<any>> = NonNullable<MonadValue<T>>;

const isPromise = (x: any): x is PromiseLike<any> => typeof x.then === 'function';

const getMap = (x: MonadLike<any>): Monad<any>['map'] => {
    if (isPromise(x)) return x.then.bind(x) as any;

    return x.map.bind(x) as any;
};

export class MaybeT<T extends MonadLike<unknown>> {
    private constructor(private value: T) {}

    static maybeT<V extends MonadLike<unknown>>(monad: V) {
        return new MaybeT(monad);
    }

    map<U extends NotVoid>(f: (v: MaybeValue<T>) => U): MaybeT<Monad<U>> {
        const map = getMap(this.value);
        return new MaybeT(map(inner =>
            maybe(inner)
                .map(f)
                .asNullable() as any,
        ));
    }

    caseOf<R>(matcher: MatchType<MaybeValue<T>, R>): MaybeT<Monad<R>> {
        const map = getMap(this.value);
        return new MaybeT(map(inner =>
            maybe(inner)
                .caseOf(matcher)
                .asNullable() as any,
        ));
    }

    orElse<U extends MonadValue<any>>(def: U | (() => U)): T | U {
        const map = getMap(this.value);
        return map(inner =>
            maybe(inner)
                .orElse(def),
        );
    }

    asNullable() { return this.value; }
    asType<M extends MonadLike<Nullable<MonadValue<T>>>>(c: ConstructorFor<M>): M {
        if (!(this.value instanceof c)) throw new Error(`Expected value to be instance of monad ${c.name}`);

        return this.value;
    }
}

export const maybeT = MaybeT.maybeT;
