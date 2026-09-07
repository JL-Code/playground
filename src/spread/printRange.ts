export type PrintRange = {
  row: number;
  col: number;
  rowCount: number;
  colCount: number;
};

const CELL = /^([A-Za-z]+)([1-9][0-9]*)$/;

function colIndex(letters: string): number {
  let n = 0;
  for (const ch of letters.toUpperCase()) {
    const code = ch.charCodeAt(0);
    if (code < 65 || code > 90) {
      return -1;
    }
    n = n * 26 + (code - 64);
  }
  return n - 1;
}

function parseCell(token: string): { row: number; col: number } | null {
  const match = CELL.exec(token);
  if (!match) {
    return null;
  }
  const col = colIndex(match[1]);
  if (col < 0) {
    return null;
  }
  return { row: Number(match[2]) - 1, col };
}

export function parsePrintRange(input: string): PrintRange | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  const parts = trimmed.split(":");
  if (parts.length > 2) {
    return null;
  }
  const start = parseCell(parts[0]);
  if (!start) {
    return null;
  }
  if (parts.length === 1) {
    return { row: start.row, col: start.col, rowCount: 1, colCount: 1 };
  }
  const end = parseCell(parts[1] ?? "");
  if (!end) {
    return null;
  }
  const row = Math.min(start.row, end.row);
  const col = Math.min(start.col, end.col);
  return {
    row,
    col,
    rowCount: Math.abs(end.row - start.row) + 1,
    colCount: Math.abs(end.col - start.col) + 1,
  };
}
