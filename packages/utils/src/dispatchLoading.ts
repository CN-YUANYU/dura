import type { Store as ReduxStore } from 'redux';
import type { LoadingSettings } from '@dura/types';

export async function dispatchLoading<S>(
  reduxStore: ReduxStore<S>,
  type: string,
  loading: boolean | LoadingSettings,
  fn: () => any,
) {
  const dispatchTrue = (type: string) =>
    reduxStore.dispatch({
      type: 'D/CHANGE_LOADING',
      payload: {
        k: type,
        v: {
          status: true,
          error: null,
        },
      },
    });
  const dispatchFalse = (type: string) =>
    reduxStore.dispatch({
      type: 'D/CHANGE_LOADING',
      payload: {
        k: type,
        v: {
          status: false,
          error: null,
        },
      },
    });

  const dispatchError = (type: string, e: Error) =>
    reduxStore.dispatch({
      type: 'D/CHANGE_LOADING',
      payload: {
        k: type,
        v: {
          status: false,
          error: e,
        },
      },
    });

  const finallyTyoe =
    typeof loading === 'boolean'
      ? `${type}`
      : `${type}/customize/${loading.customizeId}`;

  try {
    dispatchTrue(finallyTyoe);
    await fn();
    dispatchFalse(finallyTyoe);
  } catch (error) {
    dispatchError(finallyTyoe, error);
  }
}
