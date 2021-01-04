import {
  createStore as reduxCreateStore,
  combineReducers,
  applyMiddleware,
  PreloadedState,
  ReducersMapObject,
  StoreEnhancer,
} from 'redux';
import { createDefineReducer } from './createDefineReducer';
import { createDefineAsync } from './createDefineAsync';
import { createUseMount } from './createUseMount';
import { createUseState } from './createUseState';
import { createAsyncMiddleware } from './middleware';
import { createGlobalStorage, createSliceStorage } from './createStorage';
import { Action, Func, DeepState } from './@types';
import { createCompose } from './createCompose';
import { SET_STATE_NAME } from './createNamed';
import { createUseAction } from './createUseAction';

function configura<S, A extends Action>(
  reducer: ReducersMapObject = {},
  preloadedState?: PreloadedState<any>,
  enhancer?: StoreEnhancer,
) {
  const globalStorage = createGlobalStorage();
  globalStorage.reducers = reducer;
  const middleware = createAsyncMiddleware(globalStorage);
  return function createStore() {
    const compose = createCompose('dura');
    let _enhancer;
    if (enhancer) {
      compose(enhancer, applyMiddleware(middleware));
    } else {
      _enhancer = compose(applyMiddleware(middleware));
    }
    const store = reduxCreateStore(
      combineReducers({
        ...globalStorage.reducers,
        ...globalStorage.coreReducers,
      }),
      preloadedState,
      _enhancer,
    );

    function createSlice<S>(name: string, initialState: S) {
      globalStorage.effects[name] = {};
      const sliceStorage = createSliceStorage();
      const defineReducer = createDefineReducer<S>(name, store, sliceStorage);
      const defineAsync = createDefineAsync(name, store, sliceStorage);
      const useMount = createUseMount(
        name,
        initialState,
        store,
        sliceStorage,
        globalStorage,
      );
      const useState = createUseState<S>(name, store);

      function useBindState<T extends Func>(options: {
        transform?: T;
        changeName?: string;
      }) {
        return function (path: DeepState<S, ''>) {
          const run = (payload, meta) => {
            store.dispatch({
              type: `${name}/${SET_STATE_NAME}`,
              payload: [path, payload.value],
              meta,
            });
          };
          return {
            [options?.changeName ?? 'onChange']: createUseAction(run)({
              transform: options?.transform,
            }).run,
            value: store.getState()[name][path],
          };
        };
      }

      return {
        defineReducer,
        defineAsync,
        useMount,
        useBindState,
        useState,
        getState: (): S => store.getState()[name],
        store,
      };
    }

    return { createSlice, store };
  };
}

export { configura };
export * from './@types';
export * from './transform';
