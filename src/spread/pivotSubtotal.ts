export type GcLike = {
  Pivot?: { SubtotalType?: { sum?: number } };
  default?: { Pivot?: { SubtotalType?: { sum?: number } } };
};

/**
 * SubtotalType lives on `GC.Pivot` (pivot engine). Vite's `import * as GC`
 * shallow-copies the CJS export before the addon attaches `Pivot`, but keeps
 * the live object on `GC.default`.
 */
export function pivotSubtotalSum(gc: GcLike | undefined): number {
  const live = gc?.default ?? gc;
  const sum = live?.Pivot?.SubtotalType?.sum;
  if (typeof sum !== "number") {
    throw new Error(
      "GC.Pivot.SubtotalType.sum is missing; import @mescius/spread-sheets-pivot-addon",
    );
  }
  return sum;
}
