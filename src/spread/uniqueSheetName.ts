export type TakeSheetNamePlan =
  | { kind: "noop" }
  | { kind: "take"; currentTo: string }
  | {
      kind: "displace";
      occupantFrom: string;
      occupantTo: string;
      currentTo: string;
    };

export function nextIndexedName(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  for (let n = 1; n <= 99; n++) {
    const candidate = `${base}_${String(n).padStart(2, "0")}`;
    if (!used.has(candidate)) {
      return candidate;
    }
  }
  throw new Error(`no free indexed name for ${base}`);
}

export function planTakeSheetName(
  currentName: string,
  allNames: string[],
  target: string,
): TakeSheetNamePlan {
  if (currentName === target) {
    return { kind: "noop" };
  }

  const occupantExists = allNames.some((name) => name === target);
  if (!occupantExists) {
    return { kind: "take", currentTo: target };
  }

  return {
    kind: "displace",
    occupantFrom: target,
    occupantTo: nextIndexedName(target, allNames),
    currentTo: target,
  };
}
