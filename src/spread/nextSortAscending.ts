export type SortConditionLike = {
  index?: number;
  ascending?: boolean;
};

export type SortStateLike = {
  sortConditions?: SortConditionLike[];
} | null;

/**
 * 根据表格已有排序决定下一方向。从未排过或未排过该列时首次降序。
 */
export function nextSortAscending(
  state: SortStateLike | undefined,
  col: number,
): boolean {
  const current = state?.sortConditions?.find(
    (item) => item.index === col && typeof item.ascending === "boolean",
  );
  return current ? !current.ascending : false;
}
