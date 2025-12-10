import { Workbook } from "exceljs";

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

}