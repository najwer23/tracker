import { expect, test } from 'vitest';
import { csum, sum } from './Home.utils';

test(`2 + 2 to equal 4`, () => {
  const r = csum(2)(2);
  expect(r).toStrictEqual(4);
  expect(sum(2, 2)).toStrictEqual(4);
});
