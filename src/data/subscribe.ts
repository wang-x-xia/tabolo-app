import type {Extendable} from "./base";

export const SubscribableExtendsKey = "subscribe";

export interface Subscribable {
    [SubscribableExtendsKey]: SubscribableHandler<this>;
}

export type Callback<T> = (value: T) => void

export interface SubscribableHandler<T> {
    provider: string;

    subscribe(callback: Callback<Exclude<T, Subscribable>>): SubscribeResult;
}

export interface SubscribeResult {
    stop(): void;
}

export function extendSubscribable<T extends Extendable>(value: T, handler: SubscribableHandler<T>): T {
    if (value == null) {
        return null;
    }
    if (SubscribableExtendsKey in value) {
        return value;
    }
    // @ts-ignore
    value[SubscribableExtendsKey] = handler;
    return value;
}

export function createEmptyHandler<T>(provider: string): SubscribableHandler<T> {
    return {
        provider,
        subscribe(_: Callback<Exclude<T, Subscribable>>): SubscribeResult {
            return {
                stop() {
                }
            }
        }
    }
}

