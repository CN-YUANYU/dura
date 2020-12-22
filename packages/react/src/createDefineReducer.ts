import { Store } from 'redux';
import { Reducer, ReducerAction, SliceStorage, UseFn } from './@types';
import { createAction, createUseAction } from './createAction';

export function createDefineReducer<S>(
  name: string,
  store: Store,
  sliceStorage: SliceStorage,
) {
  return function defineReducer<P, M, F extends Reducer<S, P, M>>(
    fn: F,
  ): {
    run: ReducerAction<P, M>;
    useAction: UseFn<ReducerAction<P, M>>;
  } {
    sliceStorage.reducers[fn.name] = fn;
    const run = createAction(name, store, fn) as any;
    const useAction = createUseAction(run) as any;
    return {
      run,
      useAction,
    };
  };
}
