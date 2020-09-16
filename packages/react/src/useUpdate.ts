import { useReducer } from "react";

const updateReducer = (num: number): number => (num + 1) % 1_000_000;

export function useUpdate(): Function {
  const [, update] = useReducer(updateReducer, 0);
  return update;
}
