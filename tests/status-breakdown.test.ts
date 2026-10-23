import { describe, expect, it } from "vitest";
import { buildStatusBreakdown, type StatusCategory } from "@/lib/status-breakdown";

const demandCategories: StatusCategory[] = [
  { key: "IN_PROGRESS", label: "En attente", token: "waiting" },
  { key: "CONTAINERIZED", label: "Empotée", token: "containerized" },
  { key: "DISTRIBUTED", label: "Distribuée", token: "distributed" },
];

const containerCategories: StatusCategory[] = [
  { key: "waiting", label: "En attente", token: "waiting" },
  { key: "assigned", label: "Attribué", token: "assigned" },
  { key: "containerized", label: "Empoté", token: "containerized" },
  { key: "distributed", label: "Distribué", token: "distributed" },
];

describe("buildStatusBreakdown", () => {
  it("keeps every declared status in order, including those at zero", () => {
    const breakdown = buildStatusBreakdown(
      [{ status: "CONTAINERIZED" }],
      demandCategories,
      (demand) => demand.status,
    );

    expect(breakdown.segments.map((segment) => segment.key)).toEqual([
      "IN_PROGRESS",
      "CONTAINERIZED",
      "DISTRIBUTED",
    ]);
    expect(breakdown.segments.map((segment) => segment.count)).toEqual([0, 1, 0]);
    expect(breakdown.segments.map((segment) => segment.percentage)).toEqual([0, 100, 0]);
  });

  it("counts each item once and derives an exact total", () => {
    const demands = [
      { status: "IN_PROGRESS" },
      { status: "IN_PROGRESS" },
      { status: "CONTAINERIZED" },
    ];

    const breakdown = buildStatusBreakdown(demands, demandCategories, (demand) => demand.status);

    expect(breakdown.segments.map((segment) => segment.count)).toEqual([2, 1, 0]);
    expect(breakdown.total).toBe(3);
    expect(breakdown.segments.reduce((sum, segment) => sum + segment.count, 0)).toBe(breakdown.total);
  });

  it("computes shares out of the total, rounded to one decimal", () => {
    const demands = [
      { status: "IN_PROGRESS" },
      { status: "IN_PROGRESS" },
      { status: "CONTAINERIZED" },
    ];

    const breakdown = buildStatusBreakdown(demands, demandCategories, (demand) => demand.status);

    expect(breakdown.segments.map((segment) => segment.percentage)).toEqual([66.7, 33.3, 0]);
  });

  it("groups containers by their status key", () => {
    const containers = [
      { state: { key: "waiting" } },
      { state: { key: "assigned" } },
      { state: { key: "assigned" } },
      { state: { key: "distributed" } },
    ];

    const breakdown = buildStatusBreakdown(
      containers,
      containerCategories,
      (container) => container.state.key,
    );

    expect(breakdown.segments.map((segment) => segment.count)).toEqual([1, 2, 0, 1]);
    expect(breakdown.total).toBe(4);
  });

  it("returns zeros and no division by zero when there is no data", () => {
    const breakdown = buildStatusBreakdown([], containerCategories, () => null);

    expect(breakdown.total).toBe(0);
    expect(breakdown.segments).toHaveLength(containerCategories.length);
    expect(breakdown.segments.every((segment) => segment.count === 0 && segment.percentage === 0)).toBe(true);
  });

  it("ignores statuses that are not declared", () => {
    const breakdown = buildStatusBreakdown(
      [{ status: "IN_PROGRESS" }, { status: "UNKNOWN" }],
      demandCategories,
      (demand) => demand.status,
    );

    expect(breakdown.total).toBe(1);
    expect(breakdown.segments.find((segment) => segment.key === "IN_PROGRESS")?.count).toBe(1);
  });
});
