import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Button } from 'antd';
import { store } from './store';

const App = () => {
  const state = store.useStore([]);

  const actions = store.actions;
  const onClick = React.useCallback(() => {
    actions.user.onAsyncQuery(
      { name: `张三${Math.random()}` },
      {
        debounce: {
          leading: true,
          wait: 500,
        },
      },
    );
  }, []);
  console.log(state);

  return (
    <>
      <h1>姓名：{state.user.name}</h1>
      <Button type="primary" onClick={onClick}>
        修改
      </Button>
    </>
  );
};

export default App;
