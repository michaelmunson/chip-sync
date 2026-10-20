import Forest from "@mui/icons-material/Forest";
import Grain from "@mui/icons-material/Grain";
import Layers from "@mui/icons-material/Layers";
import { Marker } from "../../types/dataTypes";

export type MaterialType = Marker["type"];
export type Material = "chips" | "wood";

export const MATERIAL_LABEL: Record<Material, string> = {
  chips: "Chips",
  wood: "Wood",
};

export const TYPE_LABEL: Record<MaterialType, string> = {
  chips: "Chips only",
  wood: "Wood only",
  both: "Chips and wood",
};

export function materialsOf(type: MaterialType): Material[] {
  return type === "both" ? ["chips", "wood"] : [type];
}

export function typeFromMaterials(materials: Set<Material>): MaterialType {
  return materials.size > 1 ? "both" : ([...materials][0] as Material);
}

/** One pill per accepted material. */
export function MaterialPills({ type }: { type: MaterialType }) {
  return (
    <span className="pill-row">
      {materialsOf(type).map((m) => (
        <span key={m} className={`pill pill--${m}`}>
          {MATERIAL_LABEL[m]}
        </span>
      ))}
    </span>
  );
}

export function MaterialIcon({ type }: { type: MaterialType }) {
  if (type === "chips") return <Grain />;
  if (type === "wood") return <Forest />;
  return <Layers />;
}

/** Colored square icon that encodes the accepted material at a glance. */
export function MaterialTile({
  type,
  large = false,
}: {
  type: MaterialType;
  large?: boolean;
}) {
  return (
    <span
      className={`tile tile--${type}${large ? " tile--lg" : ""}`}
      aria-hidden="true"
    >
      <MaterialIcon type={type} />
    </span>
  );
}
