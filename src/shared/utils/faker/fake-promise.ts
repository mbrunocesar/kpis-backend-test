export async function fakePromise<T>(value: any, delay = 50) {
  return new Promise<T>((res) =>
    setTimeout(() => {
      res(value);
    }, delay),
  );
}
