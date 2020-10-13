import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Button } from 'antd';
import { store } from './store';
let index = 0;
const App = () => {
  const state = store.useStore([]);

  const actions = store.actions;
  const onClick = React.useCallback(() => {
    actions.user.onAsyncQuery({ name: `张三${++index}` }, { loading: true });
  }, []);
  console.log(state);

  return (
    <>
      <h1>姓名：{state.user.name}</h1>
      <Button
        type="primary"
        onClick={onClick}
        loading={state.D.LOADING?.user?.onAsyncQuery?.status}
      >
        修改
      </Button>
    </>
  );
};

export default App;
