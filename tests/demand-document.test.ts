import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH } from "@/app/api/demands/route";
import { prisma } from "@/app/api/prisma";
import FilesService from "@/app/api/files/files.service";
import { createAssociation, createDemand, resetDatabase } from "./helpers/db";

describe("PATCH /api/demands — document", () => {
  beforeEach(async () => {
    await resetDatabase();
    process.env.S3_BUCKET = "test-bucket";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("removes the stored document when the body sends document: null", async () => {
    const association = await createAssociation();
    const demand = await createDemand(association.id, { document: "old-key" });
    const deleteByKey = vi.spyOn(FilesService, "deleteByKey").mockResolvedValue();

    const request = new NextRequest("http://localhost/api/demands", {
      method: "PATCH",
      body: JSON.stringify({ id: demand.id, document: null }),
      headers: { "content-type": "application/json" },
    });
    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.documentUrl).toBeNull();
    const stored = await prisma.demand.findUnique({ where: { id: demand.id } });
    expect(stored?.document).toBeNull();
    expect(deleteByKey).toHaveBeenCalledWith("old-key");
  });

  it("replaces the stored document when a new file is uploaded", async () => {
    const association = await createAssociation();
    const demand = await createDemand(association.id, { document: "old-key" });
    const upload = vi.spyOn(FilesService, "upload").mockResolvedValue("new-key");
    vi.spyOn(FilesService, "getDownloadUrl").mockResolvedValue("new-url");
    const deleteByKey = vi.spyOn(FilesService, "deleteByKey").mockResolvedValue();

    const file = new File(["%PDF-1.4"], "justificatif.pdf", { type: "application/pdf" });
    const formData = new FormData();
    formData.append("body", JSON.stringify({ id: demand.id }));
    formData.append("file", file);

    const request = new NextRequest("http://localhost/api/demands", {
      method: "PATCH",
      body: formData,
    });
    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(upload).toHaveBeenCalled();
    expect(body.documentUrl).toBe("new-url");
    const stored = await prisma.demand.findUnique({ where: { id: demand.id } });
    expect(stored?.document).toBe("new-key");
    expect(deleteByKey).toHaveBeenCalledWith("old-key");
  });
});
