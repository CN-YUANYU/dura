import { defineStoreSlice } from './defineStoreSlice';
import { Action } from '@dura/types';
import { set } from '@dura/utils';

export default defineStoreSlice({
  namespace: 'D',
  state: {
    REFRESH: '0',
    LOADING: {},
  },
  reducers: {
    UPDATE(state, action: Action<{ REFRESH: string }>) {
      state.REFRESH = action.payload.REFRESH + Math.random();
      return state;
    },
    CHANGE_LOADING(state, action: Action<{ k: string; v: boolean }>) {
      const path = action.payload.k.split('/');
      set(state.LOADING, path, action.payload.v);
    },
  },
  effects: {},
});
