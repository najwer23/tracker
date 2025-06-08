type Curry<P extends any[], R> = P extends [infer F, ...infer Rest] ? (arg: F) => Curry<Rest, R> : R;

export function curry<P extends any[], R>(fn: (...args: P) => R): Curry<P, R> {
  return function curried(...args: any[]): any {
    if (args.length >= fn.length) {
      return fn(...(args as P));
    }
    return (...newArgs: any[]) => curried(...args, ...newArgs);
  } as Curry<P, R>;
}

export const sum = (a: number, b: number): number => a + b;

export const csum: Curry<[number, number], number> = curry(sum);
