import { configura as coreConfigura, defineStoreSlice } from '@dura/core';
import type {
  ConfiguraOptions,
  JsonObject,
  ReducersMapOfStoreSlice,
  EffectsMapOfStoreSlice,
  StoreSlice,
  UnionToIntersection,
  ExtractAction,
  ExtractStateByStoreUnion,
  CreateStoreReturn,
  ExtractLoadingTypes,
} from '@dura/types';
import { getUseMonitor } from './useMonitor';
import { createActionsFactory } from '@dura/utils';
import { useMemo } from 'react';

export interface Return<S, A> extends CreateStoreReturn<S, A> {
  useStore: <T>(deps?: T[]) => S;
  useActions: () => A;
}

export interface Next<SS, A> {
  <
    N extends string,
    S extends JsonObject,
    R extends ReducersMapOfStoreSlice<S>,
    E extends EffectsMapOfStoreSlice,
    STORES extends StoreSlice<N, S, R, E>[] = StoreSlice<N, S, R, E>[],
    GA = UnionToIntersection<ExtractAction<STORES[number]>>,
    GS = UnionToIntersection<ExtractStateByStoreUnion<STORES[number]>>
  >(
    ...stores: STORES
  ): Return<GS & SS, GA & A>;
}
export { defineStoreSlice };
export * from '@dura/types';
export * from '@dura/utils';

export function configura(options?: ConfiguraOptions) {
  return function create<
    N extends string,
    S extends JsonObject,
    R extends ReducersMapOfStoreSlice<S>,
    E extends EffectsMapOfStoreSlice,
    STORES extends StoreSlice<N, S, R, E>[] = StoreSlice<N, S, R, E>[],
    GA = UnionToIntersection<ExtractAction<STORES[number]>>,
    GS = UnionToIntersection<ExtractStateByStoreUnion<STORES[number]>> & {
      D: {
        LOADING: UnionToIntersection<ExtractLoadingTypes<STORES[number]>>;
      };
    }
  >(...stores: STORES): Return<GS, GA> {
    const createStore = coreConfigura(options);

    const duraStore = createStore(...stores);
    const key = stores.map((n) => n.namespace).join('.');

    const useStore = (deps = []) => getUseMonitor(key, duraStore)(deps);

    const useActions = function () {
      const createActions = createActionsFactory(duraStore);
      return useMemo(() => createActions(...stores, ...stores), []);
    };

    return {
      ...duraStore,
      useStore,
      useActions,
    } as any;
  };
}
