import { describe, expect, it } from "vitest";
import { ContainerDto } from "@/app/api/containers/dto/container.dto";
import { DEMAND_STATUSES, DemandDto } from "@/app/api/demands/dto/demand.dto";
import { STATUS_TOKENS, type StatusToken } from "@/lib/status-tokens";

type ContainerStateInput = Parameters<typeof ContainerDto.containerState>[0];

const noDates = {
  association: null,
  demand_id: null,
  containerized_at: null,
  distributed_at: null,
};

function stateOf(overrides: Partial<ContainerStateInput>) {
  return ContainerDto.containerState({ ...noDates, ...overrides });
}

describe("ContainerDto.containerState", () => {
  it.each<[string, Partial<ContainerStateInput>, StatusToken]>([
    ["En attente", {}, "waiting"],
    ["Attribué à une Demande", { demand_id: "demand-1" }, "assigned"],
    ["Empoté", { containerized_at: new Date("2026-01-01") }, "containerized"],
    ["Distribué", { distributed_at: new Date("2026-01-02") }, "distributed"],
  ])("associe l'état %s au token %s", (_label, overrides, token) => {
    expect(stateOf(overrides).key).toBe(token);
  });

  it("expose le token correspondant à chaque état dérivé", () => {
    const states = [
      stateOf({}),
      stateOf({ demand_id: "demand-1" }),
      stateOf({ containerized_at: new Date("2026-01-01") }),
      stateOf({ distributed_at: new Date("2026-01-02") }),
    ];

    for (const state of states) {
      expect(STATUS_TOKENS[state.key]).toBeDefined();
    }
  });
});

describe("DemandDto.statusData", () => {
  it("projette chaque statut de Demande sur le token correspondant", () => {
    const projections: [string, StatusToken][] = [
      ["IN_PROGRESS", "waiting"],
      ["CONTAINERIZED", "containerized"],
      ["DISTRIBUTED", "distributed"],
    ];

    expect(DEMAND_STATUSES.map((status) => DemandDto.statusData(status).key)).toEqual(
      projections.map(([, token]) => token),
    );
  });

  it("replie un statut inconnu sur un rendu neutre", () => {
    const data = DemandDto.statusData(undefined);

    expect(data.key).toBeNull();
    expect(data.text).toBe("Inconnu");
  });
});
