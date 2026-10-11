-- Recompute the denormalized aggregates (weight, volume, value) of every
-- Container from its Contents and the current ArticleType values.
--
-- These columns are snapshots taken when the container is created/updated.
-- The "value" column was added later with a default of 0 (see migration
-- 20261007160000), so containers created before it, or containers whose
-- ArticleType was edited afterwards, hold a stale aggregate while the UI
-- recomputes it live. This backfills the existing rows so that display and
-- export agree again.
UPDATE "Container" AS c
SET weight = agg.weight,
    volume = agg.volume,
    value  = agg.value
FROM (
  SELECT ct.container_id AS container_id,
         SUM(ct.quantity * at.weight) AS weight,
         SUM(ct.quantity * at.volume) AS volume,
         SUM(ct.quantity * at.value)  AS value
  FROM "Content" ct
  JOIN "ArticleType" at ON at.id = ct.type_id
  GROUP BY ct.container_id
) AS agg
WHERE c.id = agg.container_id;

-- An empty container has no contents to aggregate, so its aggregates are 0.
UPDATE "Container"
SET weight = 0,
    volume = 0,
    value  = 0
WHERE id NOT IN (SELECT container_id FROM "Content");
