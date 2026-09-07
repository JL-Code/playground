/**
 * 创建一个初始化 Sheet 的函数
 * @param seed - 初始化 Sheet 的函数
 * @returns (sheet: T | null | undefined) => void
 */
export function createEnterSeed<T>(
  seed: (sheet: T) => void,
): (sheet: T | null | undefined) => void {
  let done = false;
  return (sheet) => {
    if (done || !sheet) {
      return;
    }
    done = true;
    seed(sheet);
  };
}
