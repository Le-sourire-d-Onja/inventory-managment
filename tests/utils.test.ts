import { describe, expect, it } from "vitest";
import { formatEuro, formatVolume, formatWeight } from "@/lib/utils";

describe("formatWeight", () => {
  it("rounds to the nearest whole unit", () => {
    expect(formatWeight(12.9)).toBe("13");
  });

  it("shows no decimals", () => {
    expect(formatWeight(12.4)).toBe("12");
  });

  it("formats a whole number as is", () => {
    expect(formatWeight(250)).toBe("250");
  });

  it("groups thousands the fr-FR way", () => {
    expect(formatWeight(1234.56)).toMatch(/^1\s235$/);
  });
});

describe("formatVolume", () => {
  it("rounds to the nearest whole unit", () => {
    expect(formatVolume(0.6)).toBe("1");
  });

  it("shows no decimals", () => {
    expect(formatVolume(2.2)).toBe("2");
  });

  it("formats a whole number as is", () => {
    expect(formatVolume(3)).toBe("3");
  });

  it("groups thousands the fr-FR way", () => {
    expect(formatVolume(1999.9)).toMatch(/^2\s000$/);
  });
});

describe("formatEuro", () => {
  it("keeps two decimals", () => {
    expect(formatEuro(12.5)).toMatch(/^12,50\s€$/);
  });
});
