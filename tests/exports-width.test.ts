import { describe, expect, it } from "vitest";
import { Workbook, type Worksheet } from "exceljs";
import { ExportsService } from "@/app/api/exports/exports.service";

const MIN_WIDTH = 10;
const MAX_WIDTH = 100;
const PADDING = 2;
const LINE_HEIGHT = 15;

async function load(buffer: ArrayBuffer): Promise<Workbook> {
  const workbook = new Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
}

function sheet(workbook: Workbook, name = "Feuille 1"): Worksheet {
  const found = workbook.getWorksheet(name);
  if (!found) throw new Error(`Feuille "${name}" absente`);
  return found;
}

function widthOf(sheet: Worksheet, column: number): number {
  return sheet.getColumn(column).width ?? 0;
}

describe("ExportsService column widths", () => {
  it("never shrinks a column below the minimum width", async () => {
    const workbook = await load(
      await ExportsService.export(["Id"], [["1"], ["2"]]),
    );

    expect(widthOf(sheet(workbook), 1)).toBe(MIN_WIDTH);
  });

  it("fits each column to its longest value, header included", async () => {
    const workbook = await load(
      await ExportsService.export(
        ["123456789012", "Nom"],
        [["1", "Riz complet"]],
      ),
    );

    // Le chiffre vaut une unité de largeur : l'en-tête est bien pris en compte.
    expect(widthOf(sheet(workbook), 1)).toBe("123456789012".length + PADDING);
    // Le texte est mesuré en unités de police, donc plus étroit que ses caractères.
    expect(widthOf(sheet(workbook), 2)).toBeGreaterThan(MIN_WIDTH);
    expect(widthOf(sheet(workbook), 2)).toBeLessThan(
      "Riz complet".length + PADDING,
    );
  });

  it("caps a wide column, wraps its overflow and grows the row", async () => {
    const description = "a".repeat(120);

    const workbook = await load(
      await ExportsService.export(["Description"], [[description]]),
    );
    const first = sheet(workbook);

    expect(widthOf(first, 1)).toBe(MAX_WIDTH);
    expect(first.getRow(1).getCell(1).alignment?.wrapText).toBeFalsy();

    const row = first.getRow(2);
    expect(row.getCell(1).alignment.wrapText).toBe(true);
    expect(row.height).toBe(2 * LINE_HEIGHT);
  });

  it("does not wrap a value that fits the computed width", async () => {
    const workbook = await load(
      await ExportsService.export(["Nom"], [["Riz complet"]]),
    );
    const row = sheet(workbook).getRow(2);

    expect(row.getCell(1).alignment?.wrapText).toBeFalsy();
    expect(row.height).toBeUndefined();
  });

  it("does not leave a blank line when prose fits in fewer lines than its length", async () => {
    const sentence =
      "Lot de denrées non périssables destiné à l'antenne de quartier, " +
      "réparti en plusieurs cartons selon les familles.";
    const description = `${sentence} ${sentence}`;

    const workbook = await load(
      await ExportsService.export(["Description"], [[description]]),
    );
    const first = sheet(workbook);

    expect(widthOf(first, 1)).toBe(MAX_WIDTH);
    // 225 caractères, mais deux lignes une fois la police prise en compte.
    expect(first.getRow(2).height).toBe(2 * LINE_HEIGHT);
  });

  it("counts explicit line breaks as separate visual lines", async () => {
    const workbook = await load(
      await ExportsService.export(["Nom"], [["court\nbeaucoup plus long"]]),
    );
    const first = sheet(workbook);

    expect(widthOf(first, 1)).toBeGreaterThan(MIN_WIDTH);
    expect(widthOf(first, 1)).toBeLessThan(
      "beaucoup plus long".length + PADDING,
    );
    expect(first.getRow(2).height).toBe(2 * LINE_HEIGHT);
  });

  it("aligns every cell to the top, including headers", async () => {
    const workbook = await load(
      await ExportsService.export(
        ["Nom", "Description"],
        [["Riz complet", "a".repeat(120)]],
      ),
    );
    const first = sheet(workbook);

    expect(first.getRow(1).getCell(1).alignment?.vertical).toBe("top");
    expect(first.getRow(2).getCell(1).alignment?.vertical).toBe("top");
    expect(first.getRow(2).getCell(2).alignment?.vertical).toBe("top");
    expect(first.getRow(2).getCell(2).alignment?.wrapText).toBe(true);
  });

  it("sizes every sheet of a multi-sheet export", async () => {
    const workbook = await load(
      await ExportsService.exportSheets([
        { name: "Courte", rows: [["Nom"], ["Riz complet"]] },
        { name: "Longue", rows: [["Description"], ["b".repeat(120)]] },
        { name: "Vide", rows: [] },
      ]),
    );

    expect(widthOf(sheet(workbook, "Courte"), 1)).toBeGreaterThan(MIN_WIDTH);
    expect(widthOf(sheet(workbook, "Longue"), 1)).toBe(MAX_WIDTH);
    expect(sheet(workbook, "Longue").getRow(2).getCell(1).alignment.wrapText).toBe(
      true,
    );
  });
});
