import type { ReducersMapObject } from 'redux';
import type {
  ConfiguraOptions,
  JsonObject,
  StoreSlice,
  UnionToIntersection,
  ExtractStateByStoreUnion,
  ExtractAction,
  ReducersMapOfStoreSlice,
  EffectsMapOfStoreSlice,
  CreateStoreReturn,
  EffectsMapOfStore,
  ExtractLoadingTypes,
} from '@dura/types';
import {
  compose as reduxCompose,
  applyMiddleware,
  combineReducers,
  createStore,
} from 'redux';
import {
  DURA_STORE_EFFECTS,
  DURA_STORE_REDUCERS,
  DURA_PATCHES_SYMBOL,
  createActionsFactory,
  createProxy,
  defineHiddenConstantProperty,
} from '@dura/utils';
import invariant from 'invariant';
import duraStoreSlice from './duraStoreSlice';
import { createAsyncMiddleware } from '@dura/async';
import { enablePatches, setAutoFreeze } from 'immer';
import { createReducers } from './createReducers';
import { createWatch } from './createWatch';

enablePatches();
setAutoFreeze(false);

export const defaultConfiguraOptions: ConfiguraOptions = {
  middlewares: [],
  enhancers: [],
  preloadedState: undefined,
  compose: reduxCompose,
};

export * from './defineStoreSlice';

export function configura(options?: ConfiguraOptions) {
  return function create<
    N extends string,
    S,
    R extends ReducersMapOfStoreSlice<S>,
    E extends EffectsMapOfStoreSlice,
    STORES extends StoreSlice<N, S, R, E>[] = StoreSlice<N, S, R, E>[],
    GA = UnionToIntersection<ExtractAction<STORES[number]>>,
    GS = UnionToIntersection<ExtractStateByStoreUnion<STORES[number]>> & {
      D: {
        LOADING: UnionToIntersection<ExtractLoadingTypes<STORES[number]>>;
      };
    }
  >(...stores: STORES): CreateStoreReturn<GS, GA> {
    const {
      middlewares = [],
      enhancers = [],
      compose = reduxCompose,
      preloadedState,
    } = options ?? defaultConfiguraOptions;

    const globalReducers: ReducersMapObject = {};
    const globalEffects: EffectsMapOfStore = {};
    const globalWatchs: any = {};

    function UNSAFE_use<
      N extends string,
      S,
      R extends ReducersMapOfStoreSlice<S>,
      E extends EffectsMapOfStoreSlice,
      STORES extends StoreSlice<N, S, R, E>[]
    >(...args: STORES) {
      let index = -1;
      while (++index < args.length) {
        const store = args[index];
        invariant(
          !UNSAFE_has(store),
          'store already exists, please note that the namespace needs to be unique!',
        );
        globalReducers[store.namespace] = createReducers(store);
        globalWatchs[store.namespace] = store.watchs;
        globalEffects[store.namespace] = store.effects;
      }
    }

    function UNSAFE_has<
      N extends string,
      S extends JsonObject,
      R extends ReducersMapOfStoreSlice<S>,
      E extends EffectsMapOfStoreSlice,
      STORES extends StoreSlice<N, S, R, E>
    >(store: STORES) {
      return store.namespace in globalReducers;
    }

    function UNSAFE_unUse<
      N extends string,
      S extends JsonObject,
      R extends ReducersMapOfStoreSlice<S>,
      E extends EffectsMapOfStoreSlice,
      STORES extends StoreSlice<N, S, R, E>[]
    >(...args: STORES) {
      let index = -1;
      while (++index < args.length) {
        const store = args[index];
        delete globalReducers[store.namespace];
        delete globalEffects[store.namespace];
      }
    }

    UNSAFE_use(...stores, duraStoreSlice);

    const reduxStore = createStore(
      combineReducers(globalReducers),
      preloadedState,
      compose(
        applyMiddleware(
          ...middlewares,
          createAsyncMiddleware(
            (namespace, effectName) => globalEffects[namespace]?.[effectName],
          ),
        ),
        ...enhancers,
      ),
    );

    const createActions = createActionsFactory(reduxStore);

    const globalActions = createActions(...stores) as any;

    const duraStore = {
      use,
      unUse,
      refresh,
      actions: globalActions,
      ...reduxStore,
    };

    defineHiddenConstantProperty(
      duraStore,
      DURA_STORE_REDUCERS,
      globalReducers,
    );

    defineHiddenConstantProperty(duraStore, DURA_STORE_EFFECTS, globalEffects);

    function refresh(prefix: string) {
      reduxStore.dispatch({
        type: 'D/UPDATE',
        payload: { REFRESH: prefix },
      });
      return duraStore;
    }

    function use(...args) {
      UNSAFE_use(...args);
      const actionSlice = createActions(...args);
      duraStore.actions = { ...duraStore.actions, ...actionSlice };
      reduxStore.replaceReducer(combineReducers(globalReducers));
      return duraStore;
    }

    function unUse(...args) {
      UNSAFE_unUse(...args);
      let index = -1;
      while (++index < args.length) {
        const element = args[index];
        delete duraStore.actions[element.namespace];
      }
      reduxStore.replaceReducer(combineReducers(globalReducers));
      return duraStore;
    }

    // stores.forEach((x) => {
    //   Object.entries(x.watchs).forEach(([, watch]) => {
    //     const deps = new Map<string, number>();
    //     const currState = reduxStore.getState()[x.namespace];
    //     const proxy = createProxy(currState, deps, x.namespace);
    //     watch.dep(proxy);
    //     defineHiddenConstantProperty(watch, DURA_PATCHES_SYMBOL, deps);
    //     if (watch.immediate) {
    //       setTimeout(() => watch.handler(proxy), 0);
    //     }
    //   });
    // });

    // reduxStore.subscribe(() => {
    //   Object.entries(reduxStore.getState()).map(([k, v]) => {
    //     const store = stores.find((n) => n.namespace === k);
    //     if (store) {
    //       createWatch(store, v, null, v[DURA_PATCHES_SYMBOL]);
    //     }
    //   });
    // });

    return duraStore as any;
  };
}
