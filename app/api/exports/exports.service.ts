import { Workbook, type CellValue, type Worksheet } from "exceljs";

export type ExportCell = string | number | null;

export interface ExportSheet {
  name: string;
  rows: ExportCell[][];
}

/** Narrowest column, so short values stay clickable and readable. */
const MIN_COLUMN_WIDTH = 10;

/** Widest column, so free-text values do not push the table off screen. */
const MAX_COLUMN_WIDTH = 100;

/** Extra characters so a value never touches the column border. */
const COLUMN_PADDING = 2;

/** Height of one text line in Excel, in points. */
const LINE_HEIGHT = 15;

/**
 * Approximate width of a character in column-width units, i.e. multiples of
 * the width of "0" in the default font. Counting plain characters would
 * overestimate: lowercase letters are narrower than digits.
 */
function characterWidth(char: string): number {
  if (char === " ") return 0.45;
  if ("ijlrtfI.,;:!|'’`()[]{}-–—".includes(char)) return 0.55;
  if ("mwMW".includes(char)) return 1.45;
  if (/[A-Z0-9]/.test(char)) return 1;
  return 0.87;
}

function textWidth(value: string): number {
  let width = 0;
  for (const char of value) {
    width += characterWidth(char);
  }
  return width;
}

/** Rounds a width up, so rounding can never make a fitting value wrap. */
function roundWidth(width: number): number {
  return Math.ceil(width * 100) / 100;
}

/** Width of the longest visual line of a value; explicit breaks count. */
function longestLine(value: CellValue): number {
  if (value === null || value === undefined) return 0;
  return Math.max(...String(value).split("\n").map(textWidth));
}

/** Number of visual lines a value takes when wrapped into `usableWidth`. */
function visualLines(value: CellValue, usableWidth: number): number {
  if (value === null || value === undefined) return 1;
  if (usableWidth <= 0) return 1;

  return String(value)
    .split("\n")
    .reduce(
      (total, line) =>
        total + Math.max(1, Math.ceil(textWidth(line) / usableWidth - 1e-9)),
      0,
    );
}

export class ExportsService {

  /**
   * This function is used to export data in an excel format
   *
   * @param headers - The header of the export
   * @param data - The data that has been exported
   * @returns The buffered excel file
   */
  static async export<T>(headers: string[], data: T[]): Promise<ArrayBuffer> {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet("Feuille 1");

    sheet.addRow(headers);
    for (const item of data) {
      sheet.addRow(item);
    }
    ExportsService.fitColumns(sheet);

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * This function is used to export several sheets in a single excel file.
   * A sheet is described by its name and its raw rows, in order.
   *
   * @param sheets - The sheets to write, in order
   * @returns The buffered excel file
   */
  static async exportSheets(sheets: ExportSheet[]): Promise<ArrayBuffer> {
    const workbook = new Workbook();

    for (const definition of sheets) {
      const sheet = workbook.addWorksheet(definition.name);
      for (const row of definition.rows) {
        sheet.addRow(row);
      }
      ExportsService.fitColumns(sheet);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * Sizes every column to its longest value, capped at a readable width,
   * wraps the values that the cap would otherwise cut off, and top-aligns
   * every cell so multi-line rows read from their first line.
   */
  private static fitColumns(sheet: Worksheet): void {
    const widths: number[] = [];

    sheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
        widths[columnNumber - 1] = Math.max(
          widths[columnNumber - 1] ?? 0,
          longestLine(cell.value),
        );
      });
    });

    widths.forEach((contentWidth, index) => {
      sheet.getColumn(index + 1).width = roundWidth(
        Math.min(
          MAX_COLUMN_WIDTH,
          Math.max(MIN_COLUMN_WIDTH, contentWidth + COLUMN_PADDING),
        ),
      );
    });

    sheet.eachRow({ includeEmpty: false }, (row) => {
      let lines = 1;

      row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
        const width = sheet.getColumn(columnNumber).width ?? MIN_COLUMN_WIDTH;
        const cellLines = visualLines(cell.value, width - COLUMN_PADDING);
        const wrapText = cellLines > 1 ? { wrapText: true } : {};

        cell.alignment = { ...cell.alignment, ...wrapText, vertical: "top" };

        if (cellLines > 1) {
          lines = Math.max(lines, cellLines);
        }
      });

      if (lines > 1) {
        row.height = lines * LINE_HEIGHT;
      }
    });
  }

}
