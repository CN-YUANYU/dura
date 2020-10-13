import React, { memo } from 'react';
import { Button, message } from 'antd';
import { store } from '../store';
import faker from 'faker';

function useBlock2() {
  // const actions = operator.useActions();
  const index = 8;

  const actions = store.useActions();
  const onClick = React.useCallback(() => {
    // actions.user.onChangeStreetAddress({id:index,streetAddress:faker.address.streetAddress()})
    actions.user.onChangeStreetAddress({
      id: index,
      streetAddress: faker.address.streetAddress(),
    });
  }, []);
  const onClickAsync = React.useCallback(() => {
    // actions.user.onAsyncQuery({
    //   id: index,
    //   streetAddress: faker.address.streetAddress(),
    // });
    actions.user.onAsyncQuery(null, {
      debounce: {
        leading: true,
        wait: 500,
      },
    });
  }, []);
  return { onClick, index, onClickAsync };
}

export default memo(function Block2(props) {
  const { onClick, onClickAsync } = useBlock2();

  const state = store.useStore();

  console.log('block2', state.D.LOADING?.user?.onAsyncQuery?.status);
  return (
    <div
      style={{
        border: '1px solid gray',
        padding: '10px',
        float: 'left',
        width: 300,
      }}
    >
      <h1>我是区块二</h1>

      <h2>{`${state.user.users?.[8]?.id}： ${state.user.users?.[8]?.streetAddress}`}</h2>

      <Button type="primary" onClick={onClick} shape="round">
        修改streetAddress
      </Button>

      <Button
        type="primary"
        loading={state.D.LOADING?.user?.onAsyncQuery?.status}
        onClick={onClickAsync}
        shape="round"
      >
        测试异步
      </Button>
    </div>
  );
});
