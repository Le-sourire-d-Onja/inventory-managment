import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { Workbook, type Worksheet } from "exceljs";
import { GET as exportAssociations } from "@/app/api/associations/export/route";
import { AssociationDto } from "@/app/api/associations/dto/association.dto";
import { prisma } from "@/app/api/prisma";
import { PackagingType } from "@/lib/generated/prisma";
import {
  createArticleType,
  createAssociation,
  createContainer,
  createDemand,
  resetDatabase,
  seed,
} from "./helpers/db";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function exportRequest(id?: string) {
  const url = id
    ? `http://localhost/api/associations/export?id=${id}`
    : "http://localhost/api/associations/export";
  return exportAssociations(new NextRequest(url));
}

async function loadWorkbook(response: Response): Promise<Workbook> {
  const workbook = new Workbook();
  await workbook.xlsx.load(await response.arrayBuffer());
  return workbook;
}

function sheet(workbook: Workbook, name: string): Worksheet {
  const found = workbook.getWorksheet(name);
  if (!found) throw new Error(`Feuille "${name}" absente`);
  return found;
}

/** Valeurs d'une ligne, sans le décalage 1-based d'ExcelJS. */
function rowValues(sheet: Worksheet, rowNumber: number): unknown[] {
  const values = sheet.getRow(rowNumber).values;
  return Array.isArray(values) ? values.slice(1) : [];
}

function findRow(sheet: Worksheet, label: string): unknown[] {
  for (let row = 1; row <= sheet.rowCount; row += 1) {
    const values = rowValues(sheet, row);
    if (values[0] === label) return values;
  }
  throw new Error(`Ligne "${label}" absente de la feuille ${sheet.name}`);
}

function headerRow(sheet: Worksheet): unknown[] {
  return rowValues(sheet, 1);
}

function todayStamp(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

async function seedAssociationWithDemands() {
  const riz = await createArticleType({
    name: "Riz",
    weight: 2,
    volume: 0.5,
    value: 3,
  });
  const pates = await createArticleType({
    name: "Pâtes",
    weight: 1,
    volume: 0.25,
    value: 1.5,
  });
  const association = await createAssociation({
    name: "École Saint-Œuvre",
    person_in_charge: "Sœur Marie",
    address: "12 rue des Écoles",
    email: "ecole@example.com",
    phone: "0102030405",
    description: "Une école de quartier",
    created_at: new Date(2026, 0, 5, 9, 0),
  });

  const empotee = await createDemand(association.id, {
    created_at: new Date(2026, 0, 6, 8, 0),
    document: "demands/document.pdf",
  });
  await createContainer({
    id: "240001",
    weight: 10,
    volume: 1,
    value: 100,
    packaging: PackagingType.CARDBOARD,
    demand: { connect: { id: empotee.id } },
    containerized_at: new Date(2026, 1, 1, 14, 30),
    contents: { create: [{ type_id: riz.id, quantity: 5 }] },
  });

  const distribuee = await createDemand(association.id, {
    created_at: new Date(2026, 1, 2, 8, 0),
  });
  await createContainer({
    id: "240002",
    weight: 20,
    volume: 2,
    value: 200,
    packaging: PackagingType.FILM,
    demand: { connect: { id: distribuee.id } },
    containerized_at: new Date(2026, 1, 5, 10, 0),
    distributed_at: new Date(2026, 2, 10, 9, 15),
    contents: { create: [{ type_id: riz.id, quantity: 2 }] },
  });
  await createContainer({
    id: "240003",
    weight: 30,
    volume: 3,
    value: 300,
    packaging: PackagingType.TIED_STRING,
    demand: { connect: { id: distribuee.id } },
    containerized_at: new Date(2026, 1, 6, 11, 0),
    distributed_at: new Date(2026, 2, 10, 9, 15),
    contents: { create: [{ type_id: pates.id, quantity: 4 }] },
  });

  // Hors périmètre : un Contenant libre, un Contenant détaché et un Contenant
  // d'une autre Association.
  await createContainer({
    id: "240099",
    weight: 999,
    volume: 99,
    value: 999,
    packaging: PackagingType.CARDBOARD,
    contents: { create: [{ type_id: riz.id, quantity: 9 }] },
  });
  await createContainer({
    id: "240097",
    weight: 777,
    volume: 77,
    value: 777,
    packaging: PackagingType.CARDBOARD,
    demand: { connect: { id: empotee.id } },
    contents: { create: [{ type_id: riz.id, quantity: 7 }] },
  });
  await prisma.container.update({
    where: { id: "240097" },
    data: { demand_id: null },
  });
  const otherAssociation = await createAssociation({ name: "Autre association" });
  const otherDemand = await createDemand(otherAssociation.id);
  await createContainer({
    id: "240098",
    weight: 888,
    volume: 88,
    value: 888,
    packaging: PackagingType.CARDBOARD,
    demand: { connect: { id: otherDemand.id } },
    contents: { create: [{ type_id: riz.id, quantity: 8 }] },
  });

  return { association, empotee, distribuee, riz, pates };
}

describe("GET /api/associations/export", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("keeps the global export as a single unchanged sheet without id", async () => {
    await createAssociation({ name: "Association A" });
    await createAssociation({ name: "Association B" });

    const response = await exportRequest();
    const workbook = await loadWorkbook(response);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(XLSX_MIME);
    expect(workbook.worksheets).toHaveLength(1);
    expect(workbook.worksheets[0].name).toBe("Feuille 1");
    expect(headerRow(workbook.worksheets[0])).toEqual(AssociationDto.exportHeaders());
    expect(workbook.worksheets[0].rowCount).toBe(3);
  });

  it("returns 404 for an unknown association id", async () => {
    const response = await exportRequest("00000000-0000-0000-0000-000000000000");

    expect(response.status).toBe(404);
  });

  it("returns 404 for a malformed association id", async () => {
    const response = await exportRequest("not-a-uuid");

    expect(response.status).toBe(404);
  });

  it("returns an XLSX workbook with the four sheets for a known association", async () => {
    const { association } = await seedAssociationWithDemands();

    const response = await exportRequest(association.id);
    const workbook = await loadWorkbook(response);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(XLSX_MIME);
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      "Association",
      "Demandes",
      "Contenants",
      "Contenus",
    ]);
  });

  it("names the file after the transliterated association and today's date", async () => {
    const { association } = await seedAssociationWithDemands();

    const response = await exportRequest(association.id);

    expect(response.headers.get("Content-Disposition") ?? "").toContain(
      `association-ecole-saint-oeuvre-${todayStamp()}.xlsx`,
    );
  });

  it("falls back to the identifier when the name has no ASCII form", async () => {
    const association = await createAssociation({ name: "東京" });

    const response = await exportRequest(association.id);

    expect(response.headers.get("Content-Disposition") ?? "").toContain(
      `association-${association.id}-${todayStamp()}.xlsx`,
    );
  });

  it("puts the complete association record and totals on the Association sheet", async () => {
    const { association } = await seedAssociationWithDemands();

    const workbook = await loadWorkbook(await exportRequest(association.id));
    const first = sheet(workbook, "Association");

    expect(findRow(first, "Nom")[1]).toBe("École Saint-Œuvre");
    expect(findRow(first, "Type")[1]).toBe("Association");
    expect(findRow(first, "Personne en charge")[1]).toBe("Sœur Marie");
    expect(findRow(first, "Adresse")[1]).toBe("12 rue des Écoles");
    expect(findRow(first, "E-mail")[1]).toBe("ecole@example.com");
    expect(findRow(first, "Téléphone")[1]).toBe("0102030405");
    expect(findRow(first, "Description")[1]).toBe("Une école de quartier");
    expect(findRow(first, "Créée le")[1]).toBe("05/01/2026");
    expect(findRow(first, "Mise à jour le")[1]).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);

    expect(findRow(first, "Nombre de demandes")[1]).toBe(2);
    expect(findRow(first, "Nombre de contenants")[1]).toBe(3);
    expect(findRow(first, "Poids total (kg)")[1]).toBe(60);
    expect(findRow(first, "Volume total (m³)")[1]).toBe(6);
    expect(findRow(first, "Valeur totale (€)")[1]).toBe(600);
  });

  it("writes one row per demand with its derived status, document and totals", async () => {
    const { association, empotee, distribuee } = await seedAssociationWithDemands();

    const workbook = await loadWorkbook(await exportRequest(association.id));
    const demands = sheet(workbook, "Demandes");

    expect(headerRow(demands)).toEqual([
      "Identifiant",
      "Statut",
      "Créée le",
      "Mise à jour le",
      "Document",
      "Nombre de contenants",
      "Poids (kg)",
      "Volume (m³)",
      "Valeur (€)",
      "Contenants",
    ]);
    expect(demands.rowCount).toBe(3);

    const empoteeRow = findRow(demands, empotee.id);
    expect(empoteeRow[1]).toBe("Empotée");
    expect(empoteeRow[2]).toBe("06/01/2026");
    expect(empoteeRow[4]).toBe("Oui");
    expect(empoteeRow[5]).toBe(1);
    expect(empoteeRow[6]).toBe(10);
    expect(empoteeRow[7]).toBe(1);
    expect(empoteeRow[8]).toBe(100);
    expect(empoteeRow[9]).toBe("N°240001");

    const distribueeRow = findRow(demands, distribuee.id);
    expect(distribueeRow[1]).toBe("Distribuée");
    expect(distribueeRow[4]).toBe("Non");
    expect(distribueeRow[5]).toBe(2);
    expect(distribueeRow[6]).toBe(50);
    expect(distribueeRow[7]).toBe(5);
    expect(distribueeRow[8]).toBe(500);
    expect(distribueeRow[9]).toBe("N°240002, N°240003");
  });

  it("writes one row per attached container with status, dates and numeric aggregates", async () => {
    const { association, empotee } = await seedAssociationWithDemands();

    const workbook = await loadWorkbook(await exportRequest(association.id));
    const containers = sheet(workbook, "Contenants");

    expect(headerRow(containers)).toEqual([
      "Identifiant",
      "Demande",
      "Statut",
      "Empaquetage",
      "Poids (kg)",
      "Volume (m³)",
      "Valeur (€)",
      "Date d'empotage",
      "Date de distribution",
    ]);
    expect(containers.rowCount).toBe(4);

    const row = findRow(containers, "N°240001");
    expect(row[1]).toBe(empotee.id);
    expect(row[2]).toBe("Empoté");
    expect(row[3]).toBe("Carton");
    expect(row[4]).toBe(10);
    expect(row[5]).toBe(1);
    expect(row[6]).toBe(100);
    expect(row[7]).toBe("01/02/2026 14:30");
    expect(row[8]).toBe("");

    const distributed = findRow(containers, "N°240002");
    expect(distributed[2]).toBe("Distribué");
    expect(distributed[3]).toBe("Filmé");
    expect(distributed[7]).toBe("05/02/2026 10:00");
    expect(distributed[8]).toBe("10/03/2026 09:15");
  });

  it("writes one row per content with unit and line values as raw numbers", async () => {
    const { association } = await seedAssociationWithDemands();

    const workbook = await loadWorkbook(await exportRequest(association.id));
    const contents = sheet(workbook, "Contenus");

    expect(headerRow(contents)).toEqual([
      "Contenant",
      "Demande",
      "Type d'article",
      "Quantité",
      "Poids unitaire (kg)",
      "Volume unitaire (m³)",
      "Valeur unitaire (€)",
      "Poids de ligne (kg)",
      "Volume de ligne (m³)",
      "Valeur de ligne (€)",
    ]);
    expect(contents.rowCount).toBe(4);

    const riz = findRow(contents, "N°240001");
    expect(riz[2]).toBe("Riz");
    expect(riz[3]).toBe(5);
    expect(riz[4]).toBe(2);
    expect(riz[5]).toBe(0.5);
    expect(riz[6]).toBe(3);
    expect(riz[7]).toBe(10);
    expect(riz[8]).toBe(2.5);
    expect(riz[9]).toBe(15);

    const pates = findRow(contents, "N°240003");
    expect(pates[2]).toBe("Pâtes");
    expect(pates[3]).toBe(4);
    expect(pates[7]).toBe(4);
    expect(pates[8]).toBe(1);
    expect(pates[9]).toBe(6);
  });

  it("excludes free and detached containers from every sheet and from totals", async () => {
    const { association } = await seedAssociationWithDemands();

    const workbook = await loadWorkbook(await exportRequest(association.id));

    for (const name of ["Contenants", "Contenus"]) {
      const values = sheet(workbook, name).getSheetValues().flat();
      expect(values).not.toContain("N°240099");
      expect(values).not.toContain("N°240097");
      expect(values).not.toContain("N°240098");
    }
    const first = sheet(workbook, "Association");
    expect(findRow(first, "Nombre de contenants")[1]).toBe(3);
    expect(findRow(first, "Poids total (kg)")[1]).toBe(60);
  });

  it("still produces headers for an association with no demand", async () => {
    const association = await createAssociation({ name: "Sans demande" });

    const workbook = await loadWorkbook(await exportRequest(association.id));

    expect(sheet(workbook, "Association").rowCount).toBeGreaterThan(1);
    for (const name of ["Demandes", "Contenants", "Contenus"]) {
      const empty = sheet(workbook, name);
      expect(empty.rowCount).toBe(1);
      expect(headerRow(empty).length).toBeGreaterThan(0);
    }
    const first = sheet(workbook, "Association");
    expect(findRow(first, "Nombre de demandes")[1]).toBe(0);
    expect(findRow(first, "Nombre de contenants")[1]).toBe(0);
  });
});
