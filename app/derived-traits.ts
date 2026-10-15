type PhysicalTraits = {
  attributes?: Record<string, number>;
  disciplines?: Record<string, number>;
  disciplinePowers?: Record<string, string[]>;
};

/** Resilience is a permanent increase, not healing or a temporary power activation. */
export function healthCapacity(data: PhysicalTraits) {
  const stamina = data.attributes?.Vigor || 1;
  const fortitude = Math.max(0, data.disciplines?.Fortitude || 0);
  const hasResilience = (data.disciplinePowers?.Fortitude || []).some(name =>
    ["resiliencia", "resilience"].includes(name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase()),
  );
  return stamina + 3 + (hasResilience ? fortitude : 0);
}
