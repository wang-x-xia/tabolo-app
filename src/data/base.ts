export interface Extendable {
    [key: string]: any
}

export interface ExtendableValue<T> extends Extendable {
    value: T
}