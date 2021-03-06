import isPlainObject from 'lodash.isplainobject';
import { DURA_SYMBOL, DURA_PATCHES_SYMBOL } from './Symbol';
import { defineHiddenConstantProperty } from './defineHiddenConstantProperty';

export function createProxy<T extends object>(
  state: T,
  deps: Map<string, number>,
  parentPath?: string,
) {
  const proxy = new Proxy(state, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);

      //如果不是我自身定义的属性
      if (!target.hasOwnProperty(property) && value !== void 0) {
        return value;
      }
      // 如果是 symbol 类型 则直接返回
      if (
        property === DURA_SYMBOL ||
        property === DURA_PATCHES_SYMBOL ||
        property === Symbol.toStringTag
      ) {
        return value;
      }

      const path = caclPath(parentPath, property);

      if (isPlainObject(value) || Array.isArray(value)) {
        defineHiddenConstantProperty(value, DURA_SYMBOL, 1);
        return createProxy(value, deps, path);
      }

      const count = deps.get(path) + 1;
      if (isNaN(count)) {
        deps.set(path, 1);
      } else {
        deps.set(path, count);
      }

      return value;
    },
  });
  return proxy;
}

function caclPath(parentPath, property) {
  return parentPath ? `${parentPath}.${property}` : `${property}`;
}
