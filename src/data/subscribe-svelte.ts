import type {Extendable} from "./base";
import type {SubscribableHandler} from "./subscribe";
import {SubscribableExtendsKey} from "./subscribe";
import type {Readable} from "svelte/store";
import {readable} from "svelte/store";

export function asSvelteReadable<T extends Extendable>(value: T): Readable<T> {
    if (!(SubscribableExtendsKey in value)) {
        return readable(value);
    }
    const handler = value[SubscribableExtendsKey] as SubscribableHandler<T>
    return readable(value, (set) => {
        const {stop} = handler.subscribe(set);
        return stop;
    });
}
