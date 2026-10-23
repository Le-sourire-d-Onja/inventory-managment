import { Workbook } from "exceljs";

export type ExportCell = string | number | null;

export interface ExportSheet {
  name: string;
  rows: ExportCell[][];
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
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

}
