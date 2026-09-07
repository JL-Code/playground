export function createEnterSeed<T>(seed: (sheet: T) => void): (sheet: T | null | undefined) => void {
  let done = false;
  return (sheet) => {
    if (done || !sheet) {
      return;
    }
    done = true;
    seed(sheet);
  };
}
