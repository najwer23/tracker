import { bench } from 'vitest';
import { csum, sum } from './Home.utils';

bench(
  'csum',
  () => {
    csum(2)(2);
  },
  { time: 1000 },
);

bench(
  'sum',
  () => {
    sum(2, 2);
  },
  { time: 1000 },
);
