import repair from "./data/repair.json";
import rental from "./data/rental.json";
import secondHand from "./data/second-hand.json";
import { z } from "zod";

type AllowedGeometry = GeoJSON.Feature<
  GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon
>;

const kindProperty = z.object({
  "fivh:kind": z.union([
    z.literal("repair"),
    z.literal("rental"),
    z.literal("second-hand"),
  ]),
});

const geometrySchema = z.object({
  type: z.literal("Feature"),
  id: z.string(),
  properties: z.intersection(z.record(z.string()), kindProperty),
  geometry: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
    type: z.literal("Point"),
  }),
}) satisfies z.ZodType<AllowedGeometry>;

export type FeatureData = z.infer<typeof geometrySchema>;

const FeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(geometrySchema),
});

export type FeatureCollection = z.infer<typeof FeatureCollectionSchema>;

const repairFeatures = repair.features.map((element) => {
  const geometry = geometrySchema.parse({
    ...element,
    properties: { ...element.properties, "fivh:kind": "repair" as const },
  });
  return geometry;
});

const rentalFeatures = rental.features.map((element) => {
  const geometry = geometrySchema.parse({
    ...element,
    properties: { ...element.properties, "fivh:kind": "rental" as const },
  });
  return geometry;
});

const secondHandFeatures = secondHand.features.map((element) => {
  const geometry = geometrySchema.parse({
    ...element,
    properties: { ...element.properties, "fivh:kind": "second-hand" as const },
  });
  return geometry;
});

export const features: FeatureCollection = {
  type: "FeatureCollection",
  features: [...repairFeatures, ...rentalFeatures, ...secondHandFeatures],
};
