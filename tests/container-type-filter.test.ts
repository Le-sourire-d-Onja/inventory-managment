import { describe, expect, it } from "vitest";
import {
  articleTypeFilterOptions,
  matchesAnyArticleType,
} from "@/app/containers/filters";

const couches = { id: "type-couches", name: "Couches" };
const lait = { id: "type-lait", name: "Lait" };
const riz = { id: "type-riz", name: "Riz" };

describe("matchesAnyArticleType", () => {
  it("retient un Contenant qui porte l'un des Types d'article sélectionnés", () => {
    const contents = [{ type: couches }, { type: lait }];

    expect(matchesAnyArticleType(contents, [lait.id])).toBe(true);
  });

  it("retient un Contenant dès qu'un seul Type sélectionné est présent (OR)", () => {
    const contents = [{ type: couches }];

    expect(matchesAnyArticleType(contents, [lait.id, couches.id])).toBe(true);
  });

  it("écarte un Contenant qui ne porte aucun Type sélectionné", () => {
    const contents = [{ type: couches }, { type: lait }];

    expect(matchesAnyArticleType(contents, [riz.id])).toBe(false);
  });

  it("n'écarte rien quand aucun Type n'est sélectionné", () => {
    const contents = [{ type: couches }];

    expect(matchesAnyArticleType(contents, [])).toBe(true);
  });

  it("écarte un Contenant sans Contenu quand des Types sont sélectionnés", () => {
    expect(matchesAnyArticleType([], [couches.id])).toBe(false);
  });
});

describe("articleTypeFilterOptions", () => {
  it("liste les Types d'article présents, triés par nom", () => {
    const containers = [
      { contents: [{ type: riz }, { type: couches }] },
      { contents: [{ type: lait }] },
    ];

    expect(articleTypeFilterOptions(containers)).toEqual([
      { value: couches.id, label: "Couches" },
      { value: lait.id, label: "Lait" },
      { value: riz.id, label: "Riz" },
    ]);
  });

  it("déduplique un même Type porté par plusieurs Contenants", () => {
    const containers = [
      { contents: [{ type: lait }] },
      { contents: [{ type: lait }, { type: lait }] },
    ];

    expect(articleTypeFilterOptions(containers)).toEqual([
      { value: lait.id, label: "Lait" },
    ]);
  });

  it("renvoie une liste vide quand aucun Contenant n'a de Contenu", () => {
    expect(articleTypeFilterOptions([{ contents: [] }])).toEqual([]);
  });
});
