import { Module } from 'snabbdom';
import { State, unref } from './state';

export function stateModule<T extends State>(state: T): Module {
    return {
        destroy: () => {
            unref(state);
        }
    };
}