import ExcelJS from 'exceljs';

/**
 * Create a new workbook.
 */
export function createWorkbook(): ExcelJS.Workbook {
  return new ExcelJS.Workbook();
}

/**
 * Add a worksheet with data from an array of objects (keys become header row).
 */
export function addSheetFromJson(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  data: Record<string, unknown>[],
  columnWidths?: number[]
): void {
  const ws = workbook.addWorksheet(sheetName);
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  ws.addRow(headers);
  data.forEach((obj) => ws.addRow(headers.map((h) => obj[h])));
  if (columnWidths?.length) {
    columnWidths.forEach((w, i) => {
      ws.getColumn(i + 1).width = w;
    });
  }
}

/**
 * Add a worksheet with data from array of arrays (e.g. instructions line-by-line).
 */
export function addSheetFromAoa(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  rows: unknown[][]
): void {
  const ws = workbook.addWorksheet(sheetName);
  rows.forEach((row) => ws.addRow(row));
}

/**
 * Write workbook to buffer and trigger browser download.
 */
export async function downloadWorkbook(
  workbook: ExcelJS.Workbook,
  filename: string
): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read an XLSX buffer and return the first sheet (or specified sheet) as array of objects.
 */
export async function readWorkbookToJson(
  buffer: ArrayBuffer,
  options?: { sheetName?: string; sheetIndex?: number }
): Promise<Record<string, unknown>[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet =
    options?.sheetName != null
      ? workbook.getWorksheet(options.sheetName) ?? workbook.worksheets[0]
      : options?.sheetIndex != null
        ? workbook.worksheets[options.sheetIndex]
        : workbook.worksheets[0];
  if (!worksheet) return [];
  const headerRow = worksheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell, colNumber) => {
    const v = cell.value;
    headers[colNumber - 1] = v != null ? String(v) : `Column${colNumber}`;
  });
  const result: Record<string, unknown>[] = [];
  for (let i = 2; i <= (worksheet.rowCount ?? 1); i++) {
    const row = worksheet.getRow(i);
    const obj: Record<string, unknown> = {};
    headers.forEach((h, j) => {
      obj[h] = row.getCell(j + 1).value ?? null;
    });
    result.push(obj);
  }
  return result;
}

/**
 * Find sheet name that matches one of the preferred names (case-insensitive partial match).
 */
export function findSheetByName(
  workbook: ExcelJS.Workbook,
  preferredNames: string[]
): string | undefined {
  const names = workbook.worksheets.map((ws) => ws.name);
  for (const preferred of preferredNames) {
    const found = names.find((n) =>
      n.toLowerCase().includes(preferred.toLowerCase())
    );
    if (found) return found;
  }
  return names[0];
}

/**
 * Load workbook from buffer (for use with findSheetByName + readSheetToJson).
 */
export async function loadWorkbook(buffer: ArrayBuffer): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
}

/**
 * Read a worksheet by name from an already-loaded workbook into array of objects.
 */
export function readSheetToJson(
  workbook: ExcelJS.Workbook,
  sheetName: string
): Record<string, unknown>[] {
  const worksheet = workbook.getWorksheet(sheetName) ?? workbook.worksheets[0];
  if (!worksheet) return [];
  const headerRow = worksheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell, colNumber) => {
    const v = cell.value;
    headers[colNumber - 1] = v != null ? String(v) : `Column${colNumber}`;
  });
  const result: Record<string, unknown>[] = [];
  for (let i = 2; i <= (worksheet.rowCount ?? 1); i++) {
    const row = worksheet.getRow(i);
    const obj: Record<string, unknown> = {};
    headers.forEach((h, j) => {
      obj[h] = row.getCell(j + 1).value ?? null;
    });
    result.push(obj);
  }
  return result;
}
